import React, { useEffect, useState } from 'react'
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
  Building2,
  User,
  CheckCircle2,
  X,
  Tag,
  Send,
  Image as ImageIcon,
  Link as LinkIcon,
  Flame,
  Award,
  Clock,
  ThumbsUp,
  MoreVertical,
  Trash2
} from 'lucide-react'
import { postService, Post, PostComment } from '../services/postService'
import { profileService } from '../services/profileService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const CATEGORIES = [
  'All Posts',
  'Saved Posts',
  'Company Hiring',
  'Candidate Showcase',
  'Interview Experience',
  'Career Tips',
  'Tech Insight'
]

export default function PostsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const nav = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All Posts')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  // Add Post Form State
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState<Post['category']>('Candidate Showcase')
  const [formDescription, setFormDescription] = useState('')
  const [formAuthorType, setFormAuthorType] = useState<'candidate' | 'company'>('candidate')
  const [formCompanyName, setFormCompanyName] = useState('Northstar Analytics')
  const [formTags, setFormTags] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [linkTitle1, setLinkTitle1] = useState('')
  const [linkUrl1, setLinkUrl1] = useState('')
  const [linkType1, setLinkType1] = useState<'github' | 'live' | 'portfolio' | 'article' | 'job'>('github')
  const [linkTitle2, setLinkTitle2] = useState('')
  const [linkUrl2, setLinkUrl2] = useState('')
  const [linkType2, setLinkType2] = useState<'github' | 'live' | 'portfolio' | 'article' | 'job'>('live')

  const profile = profileService.get()

  useEffect(() => {
    loadPosts()
    const tagParam = searchParams.get('tag')
    const viewParam = searchParams.get('view')
    if (tagParam) setActiveTag(tagParam)
    if (viewParam === 'saved') setSelectedCategory('Saved Posts')
  }, [searchParams])

  const loadPosts = () => {
    setPosts(postService.getPosts())
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleLike = (postId: string) => {
    postService.toggleLike(postId)
    loadPosts()
  }

  const handleBookmark = (postId: string) => {
    const isSaved = postService.toggleBookmark(postId)
    loadPosts()
    showToast(isSaved ? 'Post bookmarked to saved items 📌' : 'Post removed from bookmarks')
  }

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return
    postService.addComment(postId, {
      authorName: profile?.name || 'Avinash Tiwari',
      authorRole: profile?.headline || 'Lead Business Analyst',
      authorAvatar:
        profile?.profilePhoto ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      content: commentText.trim()
    })
    setCommentText('')
    loadPosts()
    showToast('Comment posted! 💬')
  }

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formDescription.trim()) {
      showToast('Please fill in both title and description.')
      return
    }

    const links = []
    if (linkTitle1.trim() && linkUrl1.trim()) {
      links.push({ title: linkTitle1.trim(), url: linkUrl1.trim(), iconType: linkType1 })
    }
    if (linkTitle2.trim() && linkUrl2.trim()) {
      links.push({ title: linkTitle2.trim(), url: linkUrl2.trim(), iconType: linkType2 })
    }

    const parsedTags = formTags
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))

    if (parsedTags.length === 0) {
      parsedTags.push('#career', '#tech')
    }

    postService.createPost({
      title: formTitle,
      description: formDescription,
      authorName: formAuthorType === 'candidate' ? (profile?.name || 'Avinash Tiwari') : `${formCompanyName} Team`,
      authorRole: formAuthorType === 'candidate' ? (profile?.headline || 'Lead Business Analyst') : 'Hiring Partner',
      authorType: formAuthorType,
      companyName: formAuthorType === 'company' ? formCompanyName : undefined,
      companyBadge: formAuthorType === 'company' ? '4.9 ★ Fast Responder' : undefined,
      authorAvatar:
        formAuthorType === 'candidate'
          ? profile?.profilePhoto ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
          : 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&q=80',
      category: formCategory,
      links,
      tags: parsedTags,
      imageUrl: formImageUrl.trim() || undefined
    })

    loadPosts()
    setShowAddModal(false)
    resetForm()
    showToast('Post published to community feed! 🚀')
  }

  const resetForm = () => {
    setFormTitle('')
    setFormDescription('')
    setFormTags('')
    setFormImageUrl('')
    setLinkTitle1('')
    setLinkUrl1('')
    setLinkTitle2('')
    setLinkUrl2('')
  }

  const savedPosts = posts.filter((p) => p.isBookmarked)
  const savedCount = savedPosts.length

  // Filtered Posts
  const filteredPosts = posts.filter((p) => {
    // Saved Posts match
    if (selectedCategory === 'Saved Posts') {
      if (!p.isBookmarked) return false
    } else if (selectedCategory !== 'All Posts' && p.category !== selectedCategory) {
      return false
    }
    // Tag filter match
    if (activeTag && !p.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase())) {
      return false
    }
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const haystack = `${p.title} ${p.description} ${p.authorName} ${p.tags.join(' ')} ${p.companyName || ''}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  // Extract all popular tags
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).slice(0, 12)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white rounded-3xl p-7 sm:p-9 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-300">
              <Flame size={14} />
              <span>Gettin Career Community Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Posts & Recruitment Feeds
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              Discover official company hiring drives, explore candidate project showcases, read verified interview experiences, and bookmark posts for quick reference.
            </p>

            {/* Quick Toggle Pill: All Posts vs Saved Posts */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setSelectedCategory('All Posts')
                  setActiveTag(null)
                  setSearchParams({})
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedCategory !== 'Saved Posts'
                    ? 'bg-white text-blue-900 shadow-md shadow-black/10'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Flame size={13} className={selectedCategory !== 'Saved Posts' ? 'text-amber-500' : 'text-amber-300'} />
                <span>All Community Feeds</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCategory('Saved Posts')
                  setActiveTag(null)
                  setSearchParams({ view: 'saved' })
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedCategory === 'Saved Posts'
                    ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-300'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Bookmark size={13} className={selectedCategory === 'Saved Posts' ? 'fill-amber-950 text-amber-950' : 'fill-amber-300 text-amber-300'} />
                <span>Saved Posts ({savedCount})</span>
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowAddModal(true)}
            className="bg-white text-blue-900 hover:bg-slate-100 font-bold border-none shadow-lg shadow-black/20 shrink-0"
          >
            <Plus size={18} />
            <span>Add Post</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs font-bold">
            {CATEGORIES.map((cat) => {
              const isSavedTab = cat === 'Saved Posts'
              const isActive = selectedCategory === cat && !activeTag
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat)
                    setActiveTag(null)
                    if (isSavedTab) {
                      setSearchParams({ view: 'saved' })
                    } else {
                      setSearchParams({})
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? isSavedTab
                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20 font-extrabold'
                        : 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-extrabold'
                      : isSavedTab
                        ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isSavedTab && <Bookmark size={13} className={isActive ? 'fill-white' : 'fill-amber-500 text-amber-500'} />}
                  <span>{cat}</span>
                  {isSavedTab && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-900 dark:text-amber-200'}`}>
                      {savedCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search size={15} className="text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, tags, companies..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Popular Tags Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Tag size={13} />
            <span>Popular Tags:</span>
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setActiveTag(activeTag === tag ? null : tag)
                if (activeTag !== tag) setSelectedCategory('All Posts')
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                activeTag === tag
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200/60'
              }`}
            >
              {tag}
            </button>
          ))}

          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              className="text-xs font-bold text-rose-600 hover:underline ml-2"
            >
              Clear Tag Filter ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Feed Posts (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {filteredPosts.length === 0 ? (
            selectedCategory === 'Saved Posts' ? (
              <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-sm backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
                  <Bookmark size={32} className="fill-amber-500/30 text-amber-500" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">No Saved Posts Yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    You haven't bookmarked any posts yet. Click the bookmark icon <Bookmark size={12} className="inline fill-amber-500 text-amber-500 mx-0.5" /> on any post in the community feed to save important hiring notices, interview guides, and project showcases here for instant reference.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('All Posts')
                      setSearchParams({})
                    }}
                    className="font-bold text-xs"
                  >
                    <Flame size={14} />
                    <span>Explore Community Feeds</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3 backdrop-blur-sm">
                <MessageSquare size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white">No posts found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No community posts match your selected filter or search term. Be the first to share an update!
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                  className="font-bold text-xs mt-2"
                >
                  <Plus size={14} />
                  <span>Create New Post</span>
                </Button>
              </div>
            )
          ) : (
            filteredPosts.map((post) => {
              const isCompany = post.authorType === 'company'
              const isCommentOpen = activeCommentPostId === post.id

              return (
                <div
                  key={post.id}
                  className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md dark:hover:shadow-2xl dark:hover:shadow-blue-500/5 transition-all space-y-4 backdrop-blur-sm"
                >
                  {/* Post Author Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          post.authorAvatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={post.authorName}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{post.authorName}</h3>
                          {isCompany ? (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-full text-[10px] font-bold border border-blue-200/60 dark:border-blue-800">
                              🏢 Verified Company
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800">
                              👤 Candidate
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{post.authorRole}</p>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <Clock size={10} />
                          <span>{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          {post.companyRating && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 dark:text-amber-400 font-bold">{post.companyRating} ★ Employer Rating</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.isBookmarked && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Bookmark size={10} className="fill-amber-500 text-amber-500" />
                          <span>Saved</span>
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Post Title & Description */}
                  <div className="space-y-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                      {post.title}
                    </h2>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                      {post.description}
                    </div>
                  </div>

                  {/* Attached Image */}
                  {post.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-80 bg-slate-950">
                      <img
                        src={post.imageUrl}
                        alt="Post media"
                        className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Attached Action Links */}
                  {post.links && post.links.length > 0 && (
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/70 space-y-2">
                      <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <LinkIcon size={12} />
                        <span>Attached Resources & Verified Links:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {post.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target={link.url.startsWith('http') ? '_blank' : undefined}
                            rel="noreferrer"
                            onClick={(e) => {
                              if (link.url.startsWith('/')) {
                                e.preventDefault()
                                nav(link.url)
                              }
                            }}
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:text-blue-800 rounded-xl text-xs font-bold border border-blue-200/80 dark:border-blue-800/80 flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            {link.iconType === 'github' ? (
                              <Github size={13} />
                            ) : link.iconType === 'job' ? (
                              <Briefcase size={13} />
                            ) : link.iconType === 'portfolio' ? (
                              <Globe size={13} />
                            ) : (
                              <ExternalLink size={13} />
                            )}
                            <span>{link.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setActiveTag(tag)
                          setSelectedCategory('All Posts')
                        }}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-md transition-colors border border-indigo-100/60 dark:border-indigo-900/50 cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Interactive Action Bar: Likes, Comments, Bookmark, Share */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          post.hasLiked
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                        }`}
                      >
                        <Heart
                          size={14}
                          className={post.hasLiked ? 'fill-rose-500 text-rose-500 animate-bounce' : ''}
                        />
                        <span>{post.likes} Likes</span>
                      </button>

                      {/* Comment Toggle Button */}
                      <button
                        onClick={() =>
                          setActiveCommentPostId(isCommentOpen ? null : post.id)
                        }
                        className="px-3 py-1.5 rounded-xl font-bold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare size={14} />
                        <span>{post.comments.length} Comments</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Bookmark Button */}
                      <button
                        onClick={() => handleBookmark(post.id)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          post.isBookmarked
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-slate-200/80 dark:border-slate-700'
                        }`}
                        title={post.isBookmarked ? 'Saved to bookmarks' : 'Save post'}
                      >
                        <Bookmark
                          size={15}
                          className={post.isBookmarked ? 'fill-amber-500' : ''}
                        />
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href)
                          showToast('Post link copied to clipboard!')
                        }}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Share post"
                      >
                        <Share2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Comments Section */}
                  {isCommentOpen && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
                      {/* Existing comments */}
                      {post.comments.length > 0 && (
                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                          {post.comments.map((c) => (
                            <div
                              key={c.id}
                              className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/70 dark:border-slate-700 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={c.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                                    alt={c.authorName}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                  <span className="font-bold text-slate-900 dark:text-white">{c.authorName}</span>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                                    • {c.authorRole}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 font-normal pl-8">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id)
                          }}
                          placeholder="Write a comment or ask a question..."
                          className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          className="font-bold text-xs"
                        >
                          <Send size={13} />
                          <span>Reply</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Right Sidebar: Saved Posts Quick Widget, Guidelines, Top Tags, Quick Actions (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Saved Posts Quick Access Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900 dark:text-white">
                <Bookmark size={16} className="fill-amber-500 text-amber-500" />
                <span>My Saved Posts</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                {savedCount} {savedCount === 1 ? 'Post' : 'Posts'}
              </span>
            </div>

            {savedCount === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                No bookmarked posts yet. Click the bookmark icon 🔖 on any post in the feed to save it for quick access.
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {savedPosts.slice(0, 3).map((sp) => (
                  <div
                    key={sp.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 hover:border-amber-400/60 transition-all space-y-1.5 group cursor-pointer"
                    onClick={() => {
                      setSelectedCategory('Saved Posts')
                      setSearchParams({ view: 'saved' })
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {sp.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBookmark(sp.id)
                        }}
                        className="text-amber-600 dark:text-amber-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                        title="Remove bookmark"
                      >
                        <Bookmark size={13} className="fill-amber-500" />
                      </button>
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {sp.title}
                    </h5>
                    <div className="text-[10px] text-slate-400">
                      By {sp.authorName}
                    </div>
                  </div>
                ))}

                {savedCount > 3 && (
                  <p className="text-[11px] text-slate-400 font-semibold text-center pt-1">
                    +{savedCount - 3} more saved items
                  </p>
                )}

                <button
                  onClick={() => {
                    setSelectedCategory('Saved Posts')
                    setSearchParams({ view: 'saved' })
                  }}
                  className="w-full mt-2 py-2 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Bookmark size={13} className="fill-amber-500 text-amber-500" />
                  <span>View All Saved Posts ({savedCount})</span>
                </button>
              </div>
            )}
          </div>

          {/* Post Creation Quick Widget */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <Sparkles size={15} />
              <span>Showcase on Gettin</span>
            </div>
            <h3 className="text-lg font-extrabold">Boost Recruiter Visibility</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Candidates who publish project case studies or STAR interview experiences receive <strong className="text-white">3.4x more interview invitations</strong>.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowAddModal(true)}
              className="w-full bg-white text-indigo-900 hover:bg-slate-100 font-bold text-xs border-none"
            >
              <Plus size={15} />
              <span>Publish a Case Study / Post</span>
            </Button>
          </div>

          {/* Guidelines Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 text-xs backdrop-blur-sm">
            <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={15} className="text-blue-600 dark:text-blue-400" />
              <span>Community Guidelines</span>
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Include quantifiable outcomes in project descriptions (e.g. % speed, ₹ savings).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Attach working GitHub and live demo URLs to your posts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Contact privacy is always protected — companies communicate via Gettin portal.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Post Full Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold uppercase">
                  Community Publisher
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">Create a New Post</h2>
                <p className="text-xs text-slate-500">Share your projects, interview learnings, or hiring announcements</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              {/* Author Mode Selection */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Post Author Mode</div>
                  <div className="text-slate-500 text-[11px]">Select whether you are posting as a Candidate or Company</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAuthorType('candidate')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      formAuthorType === 'candidate'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    👤 Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAuthorType('company')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      formAuthorType === 'company'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    🏢 Company
                  </button>
                </div>
              </div>

              {formAuthorType === 'company' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    placeholder="e.g. Northstar Analytics"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    required
                  />
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Post Title / Headline *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Revenue Forecasting Engine with SQL & Power BI"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Candidate Showcase">Candidate Showcase</option>
                    <option value="Interview Experience">Interview Experience</option>
                    <option value="Company Hiring">Company Hiring</option>
                    <option value="Career Tips">Career Tips</option>
                    <option value="Tech Insight">Tech Insight</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Post Description & Content (Supports Multi-line) *
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Share details, problem statement, key results, learnings, or open job requirements..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 h-32 leading-relaxed"
                  required
                />
              </div>

              {/* Attached Links (Option 1 & Option 2) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <LinkIcon size={13} className="text-blue-600" />
                  <span>Attach Verified Links (GitHub, Portfolio, Live Demo, Article, Job)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={linkTitle1}
                    onChange={(e) => setLinkTitle1(e.target.value)}
                    placeholder="Link 1 Label (e.g. GitHub Repo)"
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    value={linkUrl1}
                    onChange={(e) => setLinkUrl1(e.target.value)}
                    placeholder="URL (e.g. https://github.com/...)"
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <select
                    value={linkType1}
                    onChange={(e) => setLinkType1(e.target.value as any)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="github">GitHub Repo</option>
                    <option value="live">Live Demo</option>
                    <option value="portfolio">Public Portfolio</option>
                    <option value="article">Article / Blog</option>
                    <option value="job">Job Application</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={linkTitle2}
                    onChange={(e) => setLinkTitle2(e.target.value)}
                    placeholder="Link 2 Label (e.g. Live Demo URL)"
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    value={linkUrl2}
                    onChange={(e) => setLinkUrl2(e.target.value)}
                    placeholder="URL (e.g. https://...)"
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <select
                    value={linkType2}
                    onChange={(e) => setLinkType2(e.target.value as any)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="live">Live Demo</option>
                    <option value="github">GitHub Repo</option>
                    <option value="portfolio">Public Portfolio</option>
                    <option value="article">Article / Blog</option>
                    <option value="job">Job Application</option>
                  </select>
                </div>
              </div>

              {/* Tags & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Tags (Comma / space separated)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="#powerbi, #sql, #interview-experience"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Image / Screenshot URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="md"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" className="font-bold">
                  <Send size={14} />
                  <span>Publish Post</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
