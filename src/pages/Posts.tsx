import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  MessageSquare,
  Heart,
  Bookmark,
  Share2,
  Plus,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  Github,
  Globe,
  Briefcase,
  User,
  CheckCircle2,
  X,
  Tag,
  Send,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Award,
  Clock,
  ThumbsUp,
  MoreVertical,
  Trash2,
  Edit3,
  UserPlus,
  UserCheck,
  Lock,
  Users,
  Eye,
  Bold,
  Italic,
  List,
  ListOrdered,
  Layers,
  FileCode,
  TrendingUp,
  AlertCircle,
  FolderGit2,
  Check,
  ChevronDown,
  Upload,
  Play
} from 'lucide-react'
import {
  postService,
  Post,
  PostComment,
  PostType,
  PostVisibility,
  PostLink,
  PostMediaItem
} from '../services/postService'
import { profileService } from '../services/profileService'
import { connectionService, ConnectionUser } from '../services/connectionService'
import { notificationService } from '../services/notificationService'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import FormattedContent from '../components/common/FormattedContent'

const POST_TYPES: PostType[] = [
  'Normal Post',
  'Project Showcase',
  'Case Study',
  'Achievement',
  'Career Update',
  'Technical / Knowledge Sharing',
  'Experience Sharing'
]

export default function PostsPage() {
  const nav = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const profile = profileService.get()
  const currentUserId = profile?.id || 'candidate-1'

  // Data states
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  // Modals & Panels
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [activeMediaLightbox, setActiveMediaLightbox] = useState<{ url: string; type: 'image' | 'video'; name?: string } | null>(null)

  // Create / Edit Form States
  const [formPostType, setFormPostType] = useState<PostType>('Project Showcase')
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formHashtags, setFormHashtags] = useState('')
  const [formVisibility, setFormVisibility] = useState<PostVisibility>('public')
  const [formLinks, setFormLinks] = useState<PostLink[]>([{ label: '', url: '' }])
  const [formMedia, setFormMedia] = useState<PostMediaItem[]>([])
  const [mediaUploadError, setMediaUploadError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Load posts
  const loadPosts = () => {
    setIsLoading(true)
    try {
      const all = postService.getVisiblePosts(currentUserId)
      setPosts(all)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
    const tagParam = searchParams.get('tag')
    const tabParam = searchParams.get('tab')
    if (tagParam) setActiveTag(tagParam)
    if (tabParam) setActiveTab(tabParam)
  }, [searchParams])

  // One-time pull of real posts from every candidate (not just this browser)
  useEffect(() => {
    postService.syncFromBackend().then((synced) => {
      if (synced) loadPosts()
    })
  }, [])

  // Tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setSearchParams(tabId === 'all' ? {} : { tab: tabId })
  }

  // Handle Like
  const handleToggleLike = (postId: string) => {
    const res = postService.toggleLike(postId, currentUserId)
    loadPosts()
    if (res.isLiked) {
      showToast('Liked post! ❤️')
    }
  }

  // Handle Bookmark
  const handleToggleBookmark = (postId: string) => {
    const isSaved = postService.toggleBookmark(postId, currentUserId)
    loadPosts()
    showToast(isSaved ? '📌 Post saved to your bookmarks!' : 'Post removed from bookmarks.')
  }

  // Handle Share / Copy Link
  const handleSharePost = (post: Post) => {
    const postUrl = `${window.location.origin}/posts?post=${post.id}`
    navigator.clipboard.writeText(postUrl)
    showToast('🔗 Post link copied to clipboard!')
  }

  // Handle Connect with Author
  const handleConnectWithAuthor = async (authorId: string, authorName: string) => {
    try {
      const res = await connectionService.sendRequest(authorId)
      showToast(res.message || `Connection request sent to ${authorName}!`)
      loadPosts()
    } catch {
      showToast(`Connection request sent to ${authorName}!`)
      loadPosts()
    }
  }

  // Handle Add Comment
  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return
    const res = postService.addComment(postId, commentText.trim())
    if (res) {
      setCommentText('')
      loadPosts()
      showToast('Comment posted! 💬')
    }
  }

  // Handle Delete Comment
  const handleDeleteComment = (postId: string, commentId: string) => {
    postService.deleteComment(postId, commentId)
    loadPosts()
    showToast('Comment deleted.')
  }

  // Handle Direct Media Upload (Images & Videos)
  const handleMediaFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaUploadError(null)
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      // Validate file format
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4', 'video/quicktime', 'video/webm']
      if (!validTypes.includes(file.type)) {
        setMediaUploadError(`Unsupported file format: ${file.name}. Please upload JPG, PNG, WEBP, or MP4 videos.`)
        return
      }

      // Validate file size (Images: 10MB, Videos: 50MB)
      const isVideo = file.type.startsWith('video/')
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        setMediaUploadError(`File too large: ${file.name}. Max size is ${isVideo ? '50MB for video' : '10MB for image'}.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        const resultUrl = uploadEvent.target?.result as string
        if (resultUrl) {
          const newMediaItem: PostMediaItem = {
            id: 'med-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            type: isVideo ? 'video' : 'image',
            url: resultUrl,
            name: file.name,
            size: file.size
          }
          setFormMedia((prev) => [...prev, newMediaItem])
        }
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveMedia = (mediaId: string) => {
    setFormMedia((prev) => prev.filter((m) => m.id !== mediaId))
  }

  // Formatting Toolbar Helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = descriptionTextareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentText = textarea.value
    const selectedText = currentText.substring(start, end)
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end)
    setFormDescription(newText)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText ? selectedText.length : 4))
    }, 50)
  }

  // Links List Helpers
  const handleAddLinkRow = () => {
    setFormLinks((prev) => [...prev, { label: '', url: '' }])
  }

  const handleUpdateLinkRow = (index: number, field: 'label' | 'url', value: string) => {
    setFormLinks((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleRemoveLinkRow = (index: number) => {
    setFormLinks((prev) => prev.filter((_, i) => i !== index))
  }

  // Open Create Modal
  const openCreateModal = (type: PostType = 'Project Showcase') => {
    setEditingPost(null)
    setFormPostType(type)
    setFormTitle('')
    setFormDescription('')
    setFormHashtags('')
    setFormVisibility('public')
    setFormLinks([{ label: '', url: '' }])
    setFormMedia([])
    setMediaUploadError(null)
    setShowCreateModal(true)
  }

  // Open Edit Modal
  const openEditModal = (post: Post) => {
    setEditingPost(post)
    setFormPostType(post.postType)
    setFormTitle(post.title)
    setFormDescription(post.description)
    setFormHashtags(post.hashtags.join(' '))
    setFormVisibility(post.visibility)
    setFormLinks(post.links.length > 0 ? post.links : [{ label: '', url: '' }])
    setFormMedia(post.media || [])
    setMediaUploadError(null)
    setShowCreateModal(true)
  }

  // Handle Submit (Create or Update)
  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formDescription.trim()) {
      showToast('Please provide both a title and description.')
      return
    }

    const cleanLinks = formLinks.filter((l) => l.label.trim() && l.url.trim())
    const cleanHashtags = formHashtags
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)

    if (editingPost) {
      postService.updatePost(editingPost.id, {
        title: formTitle,
        description: formDescription,
        postType: formPostType,
        hashtags: cleanHashtags,
        links: cleanLinks,
        media: formMedia,
        visibility: formVisibility
      })
      showToast('Post updated successfully! ✨')
    } else {
      postService.createPost({
        title: formTitle,
        description: formDescription,
        postType: formPostType,
        hashtags: cleanHashtags,
        links: cleanLinks,
        media: formMedia,
        visibility: formVisibility
      })
      showToast('Post published to feed & portfolio! 🚀')
    }

    setShowCreateModal(false)
    loadPosts()
  }

  // Handle Delete Post
  const handleConfirmDeletePost = () => {
    if (!deletingPostId) return
    postService.deletePost(deletingPostId)
    setDeletingPostId(null)
    loadPosts()
    showToast('Post deleted successfully.')
  }

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Tab filter
      if (activeTab === 'my_posts') {
        if (post.authorId !== currentUserId) return false
      } else if (activeTab === 'connections') {
        if (post.authorId !== currentUserId && !connectionService.isConnected(post.authorId)) return false
      } else if (activeTab === 'case_studies') {
        if (post.postType !== 'Case Study') return false
      } else if (activeTab === 'projects') {
        if (post.postType !== 'Project Showcase') return false
      } else if (activeTab === 'achievements') {
        if (post.postType !== 'Achievement') return false
      } else if (activeTab === 'saved') {
        if (!post.savedByUserIds?.includes(currentUserId) && !post.isBookmarked) return false
      }

      // Tag filter
      if (activeTag) {
        const target = activeTag.toLowerCase().startsWith('#') ? activeTag.toLowerCase() : `#${activeTag.toLowerCase()}`
        if (!post.hashtags.some((t) => t.toLowerCase() === target)) return false
      }

      // Search Query
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase().trim()
        const matchTitle = post.title.toLowerCase().includes(term)
        const matchDesc = post.description.toLowerCase().includes(term)
        const matchAuthor = post.authorName.toLowerCase().includes(term)
        const matchTag = post.hashtags.some((t) => t.toLowerCase().includes(term))
        if (!matchTitle && !matchDesc && !matchAuthor && !matchTag) return false
      }

      return true
    })
  }, [posts, activeTab, activeTag, searchQuery, currentUserId])

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200"
        >
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
              <MessageSquare size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Community Posts & Portfolio
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Showcase projects, case studies, achievements, and career updates to recruiters and peers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="md"
            onClick={() => nav('/portfolio')}
            className="text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            aria-label="View Employer Panel Portfolio Preview"
          >
            <Globe size={15} />
            <span>Panel Portfolio View</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            id="createPostBtn"
            onClick={() => openCreateModal('Project Showcase')}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 border-none"
            aria-label="Create new candidate post or project showcase"
          >
            <Plus size={16} />
            <span>Create Post / Showcase</span>
          </Button>
        </div>
      </div>

      {/* Quick Showcase Categories Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { type: 'Project Showcase' as PostType, label: 'Project Showcase', desc: 'Demo architectures & apps', icon: FolderGit2, color: 'text-blue-600 bg-blue-50' },
          { type: 'Case Study' as PostType, label: 'Case Study', desc: 'Problem, approach & outcome', icon: Layers, color: 'text-purple-600 bg-purple-50' },
          { type: 'Achievement' as PostType, label: 'Achievement', desc: 'Certifications & milestones', icon: Award, color: 'text-amber-600 bg-amber-50' },
          { type: 'Technical / Knowledge Sharing' as PostType, label: 'Knowledge Sharing', desc: 'SQL, system design tips', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50' }
        ].map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => openCreateModal(item.type)}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all text-left group flex items-start gap-3 cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-500 truncate font-medium">{item.desc}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Search & Tabs Navigation */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Dynamic Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="feedSearchInput"
              type="text"
              aria-label="Search posts, case studies, technologies, or authors"
              placeholder="Search posts, case studies, technologies, or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {activeTag && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 shrink-0">
              <Tag size={13} />
              <span>Tag: {activeTag}</span>
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                aria-label="Remove tag filter"
                className="hover:text-indigo-900 ml-1"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100" role="tablist">
          {[
            { id: 'all', label: 'All Feed' },
            { id: 'connections', label: 'My Connections' },
            { id: 'my_posts', label: 'My Posts & Portfolio' },
            { id: 'case_studies', label: 'Case Studies' },
            { id: 'projects', label: 'Project Showcases' },
            { id: 'achievements', label: 'Achievements' },
            { id: 'saved', label: 'Saved Items' }
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-6 bg-white border border-slate-200 rounded-3xl animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
                <div className="space-y-2">
                  <div className="w-36 h-4 bg-slate-200 rounded" />
                  <div className="w-24 h-3 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="w-3/4 h-5 bg-slate-200 rounded" />
              <div className="w-full h-24 bg-slate-100 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-4 max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center shadow-xs">
            <MessageSquare size={28} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-slate-900">
              {activeTab === 'saved'
                ? 'No saved posts'
                : activeTab === 'my_posts'
                ? 'You haven’t posted yet'
                : searchQuery
                ? 'No matching posts found'
                : 'No posts in this feed'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {activeTab === 'saved'
                ? 'Click the bookmark icon on any post to save it to your personal reference library.'
                : activeTab === 'my_posts'
                ? 'Showcase a project architecture, write a case study, or share an achievement to stand out to recruiters.'
                : searchQuery
                ? 'Try searching for different keywords, technologies, or author names.'
                : 'Publish your first case study or connect with more peers to populate your feed.'}
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Button
              variant="primary"
              size="md"
              onClick={() => openCreateModal('Project Showcase')}
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 border-none"
            >
              <Plus size={14} />
              <span>Create Your First Post</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Post Cards */
        <div className="space-y-6">
          {filteredPosts.map((post) => {
            const isAuthor = post.authorId === currentUserId
            const connectionStatus = isAuthor ? 'self' : connectionService.getConnectionStatus(post.authorId)
            const isCommentsOpen = activeCommentPostId === post.id

            return (
              <article
                key={post.id}
                id={`postCard-${post.id}`}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 sm:p-7 shadow-2xs hover:shadow-sm transition-all space-y-4"
              >
                {/* Post Author Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => nav(isAuthor ? '/profile' : `/network/user/${post.authorId}`)}
                      className="shrink-0 group/avatar cursor-pointer"
                      title={`View ${post.authorName}'s Profile`}
                    >
                      {post.authorAvatar ? (
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-xs group-hover/avatar:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-base shadow-xs group-hover/avatar:scale-105 transition-transform">
                          {post.authorName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => nav(isAuthor ? '/profile' : `/network/user/${post.authorId}`)}
                          className="text-sm font-extrabold text-slate-900 hover:text-indigo-600 transition-colors truncate text-left cursor-pointer"
                        >
                          {post.authorName}
                        </button>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {post.postType}
                        </span>

                        {/* Visibility Badge */}
                        <span
                          className="text-slate-400"
                          title={`Visibility: ${post.visibility}`}
                        >
                          {post.visibility === 'public' ? (
                            <Globe size={13} className="text-slate-400" />
                          ) : post.visibility === 'connections' ? (
                            <Users size={13} className="text-blue-500" />
                          ) : (
                            <Lock size={13} className="text-amber-500" />
                          )}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {post.authorRole}
                      </div>

                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {post.updatedAt && <span className="italic ml-1">(edited)</span>}
                      </div>
                    </div>
                  </div>

                  {/* Top Right: Connection Status & Author Dropdown */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Connection Button */}
                    {!isAuthor && (
                      <div>
                        {connectionStatus === 'connected' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <UserCheck size={13} />
                            <span>Connected</span>
                          </span>
                        ) : connectionStatus === 'pending_sent' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={13} />
                            <span>Request Sent</span>
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnectWithAuthor(post.authorId, post.authorName)}
                            className="text-xs font-bold border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                            aria-label={`Connect with ${post.authorName}`}
                          >
                            <UserPlus size={13} />
                            <span>Connect</span>
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Author Edit / Delete Menu */}
                    {isAuthor && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(post)}
                          aria-label="Edit post"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit Post"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingPostId(post.id)}
                          aria-label="Delete post"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Title */}
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                  {post.title}
                </h2>

                {/* Post Description / Formatted Rich Content */}
                <FormattedContent content={post.description} className="text-slate-700 font-normal pt-1" />

                {/* Attached Media Gallery (Images & Videos) */}
                {post.media && post.media.length > 0 && (
                  <div className="pt-2">
                    <div
                      className={`grid gap-3 ${
                        post.media.length === 1 ? 'grid-cols-1' : post.media.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
                      }`}
                    >
                      {post.media.map((med) => (
                        <div
                          key={med.id}
                          className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 group/med shadow-xs"
                        >
                          {med.type === 'video' ? (
                            <div className="relative">
                              <video
                                src={med.url}
                                controls
                                className="w-full max-h-80 object-contain rounded-2xl bg-black"
                              />
                              {med.name && (
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono truncate max-w-[80%]">
                                  {med.name}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              onClick={() => setActiveMediaLightbox(med)}
                              className="cursor-pointer overflow-hidden max-h-80 flex items-center justify-center"
                            >
                              <img
                                src={med.url}
                                alt={med.name || post.title}
                                className="w-full h-full object-cover group-hover/med:scale-105 transition-transform duration-300 max-h-80"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached Links (ONLY Label + URL) */}
                {post.links && post.links.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {post.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs font-bold text-slate-800 hover:text-indigo-700 transition-all shadow-2xs group/link"
                      >
                        <ExternalLink size={13} className="text-slate-400 group-hover/link:text-indigo-600 transition-colors" />
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.hashtags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setActiveTag(tag)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Interactive Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs font-bold text-slate-600 flex-wrap">
                  <div className="flex items-center gap-2">
                    {/* Like Button */}
                    <button
                      type="button"
                      id={`likePostBtn-${post.id}`}
                      onClick={() => handleToggleLike(post.id)}
                      aria-label={`${post.hasLiked ? 'Unlike' : 'Like'} post. Current count: ${post.likes}`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        post.hasLiked
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Heart size={15} className={`transition-transform ${post.hasLiked ? 'fill-rose-600 scale-110' : ''}`} />
                      <span>{post.likes}</span>
                    </button>

                    {/* Comment Button */}
                    <button
                      type="button"
                      id={`commentToggleBtn-${post.id}`}
                      onClick={() => setActiveCommentPostId(isCommentsOpen ? null : post.id)}
                      aria-label="View and add comments"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                        isCommentsOpen
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <MessageSquare size={15} />
                      <span>{post.comments?.length || 0} Comments</span>
                    </button>

                    {/* Bookmark Button */}
                    <button
                      type="button"
                      id={`bookmarkBtn-${post.id}`}
                      onClick={() => handleToggleBookmark(post.id)}
                      aria-label={`${post.isBookmarked ? 'Remove bookmark' : 'Bookmark post'}`}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        post.isBookmarked
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                      title={post.isBookmarked ? 'Saved to bookmarks' : 'Save post'}
                    >
                      <Bookmark size={15} className={post.isBookmarked ? 'fill-amber-600' : ''} />
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      id={`shareBtn-${post.id}`}
                      onClick={() => handleSharePost(post)}
                      aria-label="Share post link"
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                      title="Copy post link"
                    >
                      <Share2 size={15} />
                    </button>
                  </div>

                  {post.viewsCount && (
                    <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <Eye size={13} />
                      <span>{post.viewsCount} views</span>
                    </div>
                  )}
                </div>

                {/* Inline Threaded Comments Section */}
                {isCommentsOpen && (
                  <div className="pt-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Add Comment Input */}
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          profile?.profilePhoto ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                        }
                        alt="Your avatar"
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all">
                        <input
                          type="text"
                          placeholder="Write a constructive comment or feedback..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleAddComment(post.id)
                            }
                          }}
                          className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentText.trim()}
                          className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all cursor-pointer"
                        >
                          <Send size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-3 pt-1">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                            <img
                              src={
                                comment.authorAvatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                              }
                              alt={comment.authorName}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                            />
                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-xs text-slate-900">{comment.authorName}</span>
                                  <span className="text-[10px] text-slate-500 font-medium">{comment.authorRole}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(comment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                  </span>
                                  {(comment.authorId === currentUserId || isAuthor) && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      aria-label="Delete comment"
                                      className="text-slate-400 hover:text-rose-600 p-0.5"
                                      title="Delete comment"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed font-normal">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 text-xs text-slate-400">
                        No comments yet. Start the conversation!
                      </div>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE / EDIT POST MODAL                                                  */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="createPostModalTitle"
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h2 id="createPostModalTitle" className="text-lg font-black text-white">
                    {editingPost ? 'Edit Post / Showcase' : 'Create Candidate Post / Showcase'}
                  </h2>
                  <p className="text-xs text-slate-300">
                    Posting as <strong>{profile?.name || 'Avinash Tiwari'}</strong> ({profile?.headline || 'Lead Business Analyst'})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close modal"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitPost} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
              {/* Post Type Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Select Post Type</label>
                <div className="flex flex-wrap gap-2">
                  {POST_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormPostType(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formPostType === t
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label htmlFor="postTitleInput" className="block text-xs font-bold text-slate-700">
                  Post Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="postTitleInput"
                  type="text"
                  required
                  placeholder="e.g. Architecting a Real-Time Reconciliation Pipeline on Snowflake"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              {/* Description with Formatting Toolbar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="postDescInput" className="block text-xs font-bold text-slate-700">
                    Content / Description <span className="text-rose-500">*</span>
                  </label>

                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n### ')}
                      title="Heading 3 (###)"
                      className="px-1.5 py-0.5 rounded-lg hover:bg-white text-slate-700 hover:shadow-2xs font-extrabold text-[11px]"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**')}
                      title="Bold"
                      className="p-1 rounded-lg hover:bg-white text-slate-700 hover:shadow-2xs"
                    >
                      <Bold size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('*', '*')}
                      title="Italic"
                      className="p-1 rounded-lg hover:bg-white text-slate-700 hover:shadow-2xs"
                    >
                      <Italic size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n• ')}
                      title="Bullet List"
                      className="p-1 rounded-lg hover:bg-white text-slate-700 hover:shadow-2xs"
                    >
                      <List size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n1. ')}
                      title="Numbered List"
                      className="p-1 rounded-lg hover:bg-white text-slate-700 hover:shadow-2xs"
                    >
                      <ListOrdered size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('[Link Title](', ')')}
                      title="Insert Link"
                      className="p-1 rounded-lg hover:bg-white text-slate-700 hover:shadow-2xs"
                    >
                      <LinkIcon size={13} />
                    </button>
                  </div>
                </div>

                <textarea
                  id="postDescInput"
                  ref={descriptionTextareaRef}
                  required
                  rows={6}
                  placeholder="Share details about your problem statement, technical solution, architecture, lessons learned, or career insights..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs sm:text-sm"
                />
              </div>

              {/* Direct Media Upload (Images & Videos) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Upload Media (Images & Videos)
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/quicktime,video/webm"
                  multiple
                  onChange={handleMediaFilesSelected}
                  className="hidden"
                  id="directMediaUploadInput"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl p-5 text-center cursor-pointer transition-all space-y-1.5"
                >
                  <Upload size={22} className="mx-auto text-indigo-600" />
                  <div className="text-xs font-bold text-slate-800">
                    Click to browse and upload Images or Videos
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Supports JPG, PNG, WEBP, MP4, MOV (Max 10MB per image, 50MB per video)
                  </div>
                </div>

                {mediaUploadError && (
                  <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{mediaUploadError}</span>
                  </div>
                )}

                {/* Previews */}
                {formMedia.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {formMedia.map((med) => (
                      <div
                        key={med.id}
                        className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 group/thumb h-28"
                      >
                        {med.type === 'video' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-white text-center">
                            <Play size={24} className="text-indigo-400 mb-1" />
                            <span className="text-[10px] font-mono truncate w-full">{med.name}</span>
                          </div>
                        ) : (
                          <img
                            src={med.url}
                            alt={med.name || 'Preview'}
                            className="w-full h-full object-cover"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(med.id)}
                          aria-label="Remove media"
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Links Section (ONLY Label + URL) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Attached External Links (Label + URL)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLinkRow}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Link</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Label (e.g. GitHub Repo)"
                        value={link.label}
                        onChange={(e) => handleUpdateLinkRow(idx, 'label', e.target.value)}
                        className="w-1/3 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="url"
                        placeholder="URL (https://github.com/...)"
                        value={link.url}
                        onChange={(e) => handleUpdateLinkRow(idx, 'url', e.target.value)}
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {formLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLinkRow(idx)}
                          aria-label="Remove link row"
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              <div className="space-y-1.5">
                <label htmlFor="hashtagsInput" className="block text-xs font-bold text-slate-700">
                  Hashtags (Space separated)
                </label>
                <input
                  id="hashtagsInput"
                  type="text"
                  placeholder="#sql #powerbi #fintech #casestudy"
                  value={formHashtags}
                  onChange={(e) => setFormHashtags(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Visibility Controls */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Post Visibility</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'public' as PostVisibility, label: '🌐 Public', desc: 'Visible to everyone' },
                    { id: 'connections' as PostVisibility, label: '👥 Connections', desc: 'Accepted peers only' },
                    { id: 'private' as PostVisibility, label: '🔒 Private', desc: 'Visible only to you' }
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setFormVisibility(v.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        formVisibility === v.id
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-2xs font-extrabold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold'
                      }`}
                    >
                      <div className="text-xs">{v.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs font-bold"
                >
                  <span>Cancel</span>
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 border-none"
                >
                  <span>{editingPost ? 'Update Post' : 'Publish Post'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {deletingPostId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 font-bold">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Post?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to delete this post from your feed and portfolio?
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingPostId(null)}
                className="text-xs font-bold"
              >
                <span>Cancel</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDeletePost}
                className="bg-rose-600 hover:bg-rose-700 text-xs font-bold border-none"
              >
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MEDIA LIGHTBOX MODAL                                                      */}
      {/* ========================================================================= */}
      {activeMediaLightbox && (
        <div
          onClick={() => setActiveMediaLightbox(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            {activeMediaLightbox.type === 'video' ? (
              <video src={activeMediaLightbox.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" />
            ) : (
              <img src={activeMediaLightbox.url} alt={activeMediaLightbox.name || 'Enlarged media'} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            )}
            <button
              type="button"
              onClick={() => setActiveMediaLightbox(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
