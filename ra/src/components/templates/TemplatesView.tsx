import { Plus, FileEdit, Users, MessageSquare } from 'lucide-react';
import { TemplateCard } from '../ui/TemplateCard';

// Mock data - will be replaced with Thoth database calls
const mockTemplates = [
  {
    id: '1',
    type: 'cover-letter' as const,
    title: 'Cover Letter - General',
    description: 'General purpose cover letter template',
    variables: ['company', 'role', 'specific_skill'],
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    useCount: 8,
  },
  {
    id: '2',
    type: 'cover-letter' as const,
    title: 'Cover Letter - Startup',
    description: 'Startup-focused cover letter with enthusiasm',
    variables: ['company', 'role', 'founder_name'],
    lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    useCount: 3,
  },
  {
    id: '3',
    type: 'references' as const,
    title: 'Reference Sheet - Technical',
    description: '3 references: Manager, Peer, Senior',
    variables: [],
    lastUsed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    useCount: 5,
  },
  {
    id: '4',
    type: 'qa' as const,
    title: 'Q&A - Leadership Questions',
    description: '4 variations of "tell me about a time you led..."',
    variables: [],
    lastUsed: undefined,
    useCount: 2,
  },
];

const typeIcons = {
  'cover-letter': FileEdit,
  references: Users,
  qa: MessageSquare,
};

export function TemplatesView() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">📝 Templates</h1>
          <p className="text-sm text-muted-foreground">
            Cover letters, reference sheets, and Q&A answers
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-3 mb-6">
        <select className="px-3 py-2 bg-card border border-border rounded-md text-sm">
          <option>All Types</option>
          <option>Cover Letters</option>
          <option>References</option>
          <option>Q&A</option>
        </select>
        <input
          type="text"
          placeholder="Search templates..."
          className="flex-1 px-3 py-2 bg-card border border-border rounded-md text-sm"
        />
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 gap-4">
        {mockTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} Icon={typeIcons[template.type]} />
        ))}

        {/* Add New Card */}
        <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">
          <Plus className="w-12 h-12 mb-2" />
          <p className="font-medium">Create from Scratch</p>
          <p className="text-sm">Or import from library</p>
        </div>
      </div>
    </div>
  );
}
