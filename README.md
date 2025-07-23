# MarkdownNotes

A Markdown based note-taking web app designed for a seamless user experience.

## Why MarkdownNotes?


- **Markdown Editor & Preview:** Real-time split view, edit, and preview modes for efficient writing and reviewing.
- **Tag Management:** Add, remove, and organize notes with tags for streamlined categorization.
- **Customizable Editor:** Adjustable font size, line height, and font family for personalized writing comfort.
- **Accessibility:** Keyboard navigation, focus indicators, and ARIA attributes for an inclusive experience.
- **Persistent Settings:** Theme and editor preferences are saved locally for convenience.



## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/MarkdownNotes.git
   cd MarkdownNotes
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Application

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser to access the application.

## Usage

- **Create and Edit Notes:** Select or create a note from the sidebar to begin editing.
- **Markdown Toolbar:** Utilize the toolbar for formatting options such as bold, italic, lists, links, and code.
- **Organize Notes:** Organize notes into folders
- **Tag System:** Use tags like #important #work #personal
- **Search Notes:** Try the search feature
- **Theme Selection:** Instantly switch between light, dark, or system mode from the editor header.
- **Saving Notes:** Notes are auto-saved or can be saved manually (Ctrl+Enter or Save button).


## Customization

- **Editor Preferences:** Adjust font size, line height, and font family in the settings.
- **Theme:** Modify theme colors in the Tailwind configuration or CSS for a custom appearance.
- **Favicon:** Replace `public/favicon.svg` to use your own branding.

## Project Structure

- `src/components/note-app/Editor.tsx` – Main editor and preview interface
- `src/components/note-app/MarkdownPreview.tsx` – Markdown rendering component
- `src/stores/noteStore.ts` – State management logic
- `public/` – Static assets (favicon, index.html)

## Accessibility and Best Practices

- Keyboard navigation and focus indicators for all interactive elements
- ARIA attributes for improved accessibility
- Responsive and mobile-friendly design

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository and create a new branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -am 'Add new feature'`
3. Push to your branch: `git push origin feature/your-feature`
4. Open a pull request for review

