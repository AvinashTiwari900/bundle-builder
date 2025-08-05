# Bundle Builder

A modern web app for creating product bundles and saving 30% when you add at least 3 items. Built with vanilla HTML, CSS, and JavaScript.

## Features

- Add products to your bundle from a grid of fashion items
- Sidebar shows selected items, progress, subtotal, discount, and total
- Quantity controls for each item in the bundle
- Responsive design for desktop and mobile
- Clean, minimal UI with accent colors and icons

## How to Use

1. Open `index.html` in your browser.
2. Click "Add to Bundle" on any product card to add it to your bundle.
3. Adjust quantities or remove items in the sidebar.
4. When you have at least 3 items, the discount is applied and you can proceed.

## File Structure

```
assets/
  icons/         # SVG icons for UI controls
  photo/         # Product images
index.html       # Main app UI
style.css        # App styles
script.js        # App logic
```

## Customization

- To change products, edit the `products` array in `script.js`.
- To update images or icons, replace files in the `assets` folder.

## License

MIT
