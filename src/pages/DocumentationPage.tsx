import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Book, Code, Settings, Database, Wrench, Type } from 'lucide-react';

const documentationFiles = [
  { 
    id: 'readme', 
    title: 'Documentation Index', 
    file: 'README',
    filename: 'README.md',
    icon: Book,
    description: 'Overview and navigation guide'
  },
  { 
    id: 'filesystem', 
    title: 'File System Structure', 
    file: '01-FILE-SYSTEM',
    filename: '01-FILE-SYSTEM.md',
    icon: FileText,
    description: 'Project directory structure and organization'
  },
  { 
    id: 'dependencies', 
    title: 'Dependencies', 
    file: '02-DEPENDENCIES',
    filename: '02-DEPENDENCIES.md',
    icon: Settings,
    description: 'All packages and their usage'
  },
  { 
    id: 'components', 
    title: 'Components', 
    file: '03-COMPONENTS',
    filename: '03-COMPONENTS.md',
    icon: Code,
    description: 'Component architecture and documentation'
  },
  { 
    id: 'flows', 
    title: 'Logic and Flows', 
    file: '04-LOGIC-AND-FLOWS',
    filename: '04-LOGIC-AND-FLOWS.md',
    icon: Code,
    description: 'Application flows and algorithms'
  },
  { 
    id: 'state', 
    title: 'State Management', 
    file: '05-STATE-MANAGEMENT',
    filename: '05-STATE-MANAGEMENT.md',
    icon: Database,
    description: 'Zustand store and state patterns'
  },
  { 
    id: 'utilities', 
    title: 'Utilities', 
    file: '06-UTILITIES',
    filename: '06-UTILITIES.md',
    icon: Wrench,
    description: 'Helper functions and utilities'
  },
  { 
    id: 'types', 
    title: 'Type Definitions', 
    file: '07-TYPES',
    filename: '07-TYPES.md',
    icon: Type,
    description: 'TypeScript types and interfaces'
  },
];

function DocumentationPage() {
  const { filename } = useParams<{ filename?: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find the file info based on URL parameter
  const currentDoc = filename 
    ? documentationFiles.find(doc => doc.file === filename)
    : null;

  useEffect(() => {
    if (filename) {
      loadDocumentation(filename);
    } else {
      // If no filename, show index or redirect to README
      setContent('');
      setError(null);
    }
  }, [filename]);

  const loadDocumentation = async (fileKey: string) => {
    setLoading(true);
    setError(null);
    
    // Find the actual filename
    const doc = documentationFiles.find(d => d.file === fileKey);
    if (!doc) {
      setError(`Documentation file not found: ${fileKey}`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/documentation/${doc.filename}`);
      if (response.ok) {
        const text = await response.text();
        setContent(text);
      } else {
        setError(`Could not load ${doc.filename}. Status: ${response.status}`);
      }
    } catch (error) {
      setError(`Failed to load documentation: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDocClick = (file: string) => {
    navigate(`/documentation/${file}`);
  };

  const renderMarkdown = (text: string) => {
    // Convert markdown links to use /documentation/ format
    let processedText = text
      // Convert relative markdown links to /documentation/ format
      .replace(/\[([^\]]+)\]\(([^)]+\.md)\)/g, (match, linkText, linkPath) => {
        // Remove .md extension and convert to route format
        const routePath = linkPath.replace('.md', '').replace(/^\.\//, '');
        // Map filename to route key
        const doc = documentationFiles.find(d => d.filename === routePath + '.md' || d.filename === linkPath);
        if (doc) {
          return `[${linkText}](/documentation/${doc.file})`;
        }
        return match;
      })
      // Convert links like [File System](./01-FILE-SYSTEM.md) to /documentation/01-FILE-SYSTEM
      .replace(/\[([^\]]+)\]\(\.\/([^)]+\.md)\)/g, (match, linkText, linkPath) => {
        const doc = documentationFiles.find(d => d.filename === linkPath);
        if (doc) {
          return `[${linkText}](/documentation/${doc.file})`;
        }
        return match;
      });

    // Simple markdown to HTML converter
    let html = processedText
      // Headers
      .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-bold mt-4 mb-2">$1</h4>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 border-b pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      // Code blocks with language
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre class="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto my-4"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
      })
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-1 rounded text-sm">$1</code>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Horizontal rule
      .replace(/^---$/gim, '<hr class="my-6 border-gray-300" />')
      // Numbered lists
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      // Bullet lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      // Links - handle both internal and external
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, linkPath) => {
        // If it's an internal documentation link
        if (linkPath.startsWith('/documentation/')) {
          return `<a href="${linkPath}" class="text-blue-600 hover:text-blue-800 hover:underline">${linkText}</a>`;
        }
        // External links
        return `<a href="${linkPath}" class="text-blue-600 hover:text-blue-800 hover:underline" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      })
      // Paragraphs
      .split('\n\n')
      .map(para => {
        para = para.trim();
        if (!para) return '';
        // Don't wrap if it's already a block element
        if (para.startsWith('<') || para.match(/^<[h|p|ul|ol|pre|hr]/)) {
          return para;
        }
        return `<p class="mb-4 leading-relaxed">${para}</p>`;
      })
      .join('')
      // Wrap lists
      .replace(/(<li[^>]*>.*<\/li>)/g, (match) => {
        if (!match.includes('<ul') && !match.includes('<ol')) {
          return `<ul class="list-disc ml-6 mb-4">${match}</ul>`;
        }
        return match;
      });

    return { __html: html };
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Customizer</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Documentation Files</h2>
              <div className="space-y-2">
                {documentationFiles.map((doc) => {
                  const Icon = doc.icon;
                  const isActive = filename === doc.file;
                  return (
                    <Link
                      key={doc.id}
                      to={`/documentation/${doc.file}`}
                      className={`block w-full text-left p-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={18} />
                        <span className="font-medium text-sm">{doc.title}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-6">{doc.description}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8 min-h-[600px]">
              {!filename ? (
                <div className="text-center py-12">
                  <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    Select a Documentation File
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Choose a documentation file from the sidebar to view its contents.
                  </p>
                  <Link
                    to="/documentation/README"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Documentation Index
                  </Link>
                </div>
              ) : loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading documentation...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    <FileText size={48} className="mx-auto mb-2" />
                    <p className="font-semibold">Error Loading Documentation</p>
                    <p className="text-sm mt-2">{error}</p>
                  </div>
                </div>
              ) : (
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={renderMarkdown(content)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentationPage;
