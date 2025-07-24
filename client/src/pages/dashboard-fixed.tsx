import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Plus, Settings, Eye, Copy, ExternalLink, BarChart3, Users, TrendingUp, Activity, Calendar, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface User {
  id: string;
  email: string;
  fullName: string;
  subscriptionStatus: string;
  quotesUsedThisMonth: number;
  quotesLimit: number;
}

interface UserCalculator {
  id: string;
  name: string;
  slug: string;
  embed_url: string;
  admin_url: string;
  calculator_id: number;
  config: any;
  custom_branding: any;
  is_active: boolean;
  template_id: string;
  layout_json: any;
  logic_json: any;
  style_json: any;
  prompt_md: string;
  created_at: string;
  last_updated: string;
}

interface CalculatorTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  template_id: string;
  slug: string;
}

const mockUser: User = {
  id: "1",
  email: "user@example.com",
  fullName: "John Doe",
  subscriptionStatus: "Pro",
  quotesUsedThisMonth: 245,
  quotesLimit: 1000
};

const calculatorTemplates: CalculatorTemplate[] = [
  { id: "1", name: "Wedding Photography Quote", category: "Photography", description: "Professional wedding photography pricing calculator", template_id: "wedding-photography", slug: "wedding-photography" },
  { id: "2", name: "Home Renovation Estimate", category: "Construction", description: "Comprehensive home renovation cost calculator", template_id: "home-renovation", slug: "home-renovation" },
  { id: "3", name: "Legal Services Quote", category: "Legal", description: "Legal consultation and services pricing", template_id: "legal-services", slug: "legal-services" },
  { id: "4", name: "Pest Control Services", category: "Professional", description: "Pest control treatment pricing calculator", template_id: "pest-control", slug: "pest-control" },
  { id: "5", name: "Portrait Photography", category: "Photography", description: "Portrait session pricing calculator", template_id: "portrait-photography", slug: "portrait-photography" },
  { id: "6", name: "Roofing Services", category: "Construction", description: "Roofing installation and repair quotes", template_id: "roofing-services", slug: "roofing-services" }
];

const performanceData = [
  { name: 'Jan', quotes: 65, conversions: 45 },
  { name: 'Feb', quotes: 78, conversions: 52 },
  { name: 'Mar', quotes: 90, conversions: 61 },
  { name: 'Apr', quotes: 85, conversions: 58 },
  { name: 'May', quotes: 105, conversions: 72 },
  { name: 'Jun', quotes: 120, conversions: 84 }
];

const clientData = [
  { id: 1, name: "Sarah Johnson", email: "sarah@email.com", project: "Wedding Photography", quote: "$2,500", status: "Accepted", date: "2024-06-10" },
  { id: 2, name: "Michael Chen", email: "mike@email.com", project: "Home Renovation", quote: "$15,000", status: "Pending", date: "2024-06-09" },
  { id: 3, name: "Emily Davis", email: "emily@email.com", project: "Legal Consultation", quote: "$350", status: "Accepted", date: "2024-06-08" },
  { id: 4, name: "Robert Wilson", email: "robert@email.com", project: "Pest Control", quote: "$180", status: "Declined", date: "2024-06-07" },
  { id: 5, name: "Lisa Anderson", email: "lisa@email.com", project: "Portrait Session", quote: "$450", status: "Accepted", date: "2024-06-06" }
];

export default function Dashboard() {
  const [user] = useState<User>(mockUser);
  const [userCalculators, setUserCalculators] = useState<UserCalculator[]>([]);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedCalculator, setSelectedCalculator] = useState<UserCalculator | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customConfig, setCustomConfig] = useState<any>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('userCalculators');
    if (saved) {
      setUserCalculators(JSON.parse(saved));
    }
  }, []);

  const filteredCalculators = calculatorTemplates.filter(calc => {
    const matchesSearch = calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || calc.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const addCalculator = (template: CalculatorTemplate) => {
    const newCalculator: UserCalculator = {
      id: `calc_${Date.now()}`,
      name: template.name,
      slug: `${template.slug}-${Date.now()}`,
      embed_url: `https://quotekit.ai/embed/${template.slug}-${Date.now()}`,
      admin_url: `https://quotekit.ai/admin/${template.slug}-${Date.now()}`,
      calculator_id: parseInt(template.id),
      config: {},
      custom_branding: {},
      is_active: true,
      template_id: template.template_id,
      layout_json: {},
      logic_json: {},
      style_json: {},
      prompt_md: "",
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };

    const updated = [...userCalculators, newCalculator];
    setUserCalculators(updated);
    localStorage.setItem('userCalculators', JSON.stringify(updated));
    setShowCalculatorModal(false);
    
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const customizeCalculator = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    setCustomConfig(calc.config || {});
    setShowCustomizeModal(true);
  };

  const previewCalculator = (calc: UserCalculator) => {
    window.open(`/calculator/${calc.template_id}`, '_blank');
  };

  const showEmbedCode = (calc: UserCalculator) => {
    setSelectedCalculator(calc);
    setShowEmbedModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-800">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Manage your quote calculators and track performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-midnight-800 border-midnight-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Calculators</p>
                  <p className="text-2xl font-bold text-white">{userCalculators.length}</p>
                </div>
                <Calculator className="h-8 w-8 text-neon-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Quotes This Month</p>
                  <p className="text-2xl font-bold text-white">{user.quotesUsedThisMonth}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-neon-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Conversion Rate</p>
                  <p className="text-2xl font-bold text-white">68%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-neon-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-midnight-800 border-midnight-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Revenue Generated</p>
                  <p className="text-2xl font-bold text-white">$23,450</p>
                </div>
                <DollarSign className="h-8 w-8 text-neon-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Calculators */}
        <Card className="bg-midnight-800 border-midnight-700 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-neon-400" />
                Your Calculators
              </CardTitle>
              <Button
                onClick={() => setShowCalculatorModal(true)}
                className="bg-neon-500 hover:bg-neon-600 text-black font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Calculator
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {userCalculators.length === 0 ? (
              <div className="text-center py-12">
                <Calculator className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No calculators yet</h3>
                <p className="text-gray-400 mb-4">Create your first calculator to start generating quotes</p>
                <Button
                  onClick={() => setShowCalculatorModal(true)}
                  className="bg-neon-500 hover:bg-neon-600 text-black font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Calculator
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userCalculators.map((calc) => (
                  <Card key={calc.id} className="bg-midnight-900 border-midnight-700 hover:border-neon-500/50 transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-white truncate">{calc.name}</h3>
                        <Badge 
                          variant={calc.is_active ? "default" : "secondary"}
                          className={calc.is_active ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"}
                        >
                          {calc.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-4">
                        Created {new Date(calc.created_at).toLocaleDateString()}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => customizeCalculator(calc)}
                          className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => previewCalculator(calc)}
                          className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => showEmbedCode(calc)}
                          className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Chart */}
          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-neon-400" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }} 
                  />
                  <Line type="monotone" dataKey="quotes" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="conversions" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-midnight-800 border-midnight-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="h-5 w-5 mr-2 text-neon-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-midnight-900 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">New quote generated</p>
                    <p className="text-xs text-gray-400">Wedding Photography - $2,500</p>
                  </div>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-midnight-900 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Calculator customized</p>
                    <p className="text-xs text-gray-400">Home Renovation Calculator</p>
                  </div>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-midnight-900 rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Quote accepted</p>
                    <p className="text-xs text-gray-400">Legal Services - $350</p>
                  </div>
                  <span className="text-xs text-gray-500">3 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Management */}
        <Card className="bg-midnight-800 border-midnight-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-neon-400" />
              Recent Client Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-midnight-700">
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Client</th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Project</th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Quote</th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Status</th>
                    <th className="text-left text-sm font-medium text-gray-400 pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {clientData.map((client) => (
                    <tr key={client.id} className="border-b border-midnight-700/50">
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium text-white">{client.name}</p>
                          <p className="text-xs text-gray-400">{client.email}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="text-sm text-gray-300">{client.project}</p>
                      </td>
                      <td className="py-3">
                        <p className="text-sm font-medium text-white">{client.quote}</p>
                      </td>
                      <td className="py-3">
                        <Badge 
                          variant={
                            client.status === 'Accepted' ? 'default' : 
                            client.status === 'Pending' ? 'secondary' : 
                            'destructive'
                          }
                          className={
                            client.status === 'Accepted' ? 'bg-green-500 text-white' :
                            client.status === 'Pending' ? 'bg-yellow-500 text-black' :
                            'bg-red-500 text-white'
                          }
                        >
                          {client.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <p className="text-sm text-gray-400">{client.date}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Calculator Selection Modal */}
        {showCalculatorModal && (
          <Dialog open={showCalculatorModal} onOpenChange={setShowCalculatorModal}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-midnight-800 border-midnight-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add Calculator</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Choose from our library of professional calculator templates.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col space-y-4 p-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    placeholder="Search calculators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-midnight-900 border-midnight-600 text-white placeholder-gray-400"
                  />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="sm:w-48 bg-midnight-900 border-midnight-600 text-white">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-midnight-900 border-midnight-600">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="professional">Professional Services</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Calculator Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredCalculators.map((calculator) => (
                    <Card 
                      key={calculator.id} 
                      className="bg-midnight-900 border-midnight-700 hover:border-neon-500/50 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-neon-500/20"
                      onClick={() => addCalculator(calculator)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-neon-400 to-neon-600 rounded-lg flex items-center justify-center">
                            <Calculator className="h-5 w-5 text-black" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white text-sm">{calculator.name}</h3>
                            <p className="text-xs text-gray-400">{calculator.category}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{calculator.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredCalculators.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-400">No calculators found matching your criteria.</p>
                      <Button
                        variant="outline"
                        onClick={() => setShowCalculatorModal(false)}
                        className="mt-2 border-midnight-600 text-gray-300 hover:bg-midnight-800"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Embed Code Modal */}
        {showEmbedModal && selectedCalculator && (
          <Dialog open={showEmbedModal} onOpenChange={setShowEmbedModal}>
            <DialogContent className="max-w-2xl bg-midnight-800 border-midnight-700">
              <DialogHeader>
                <DialogTitle className="text-white">Embed Code</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Copy and paste this code into your website to embed the calculator.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Preview URL */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Direct Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-sm text-gray-300 font-mono">
                      {`https://quotekit.ai/calc/${selectedCalculator.slug}`}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://quotekit.ai/calc/${selectedCalculator.slug}`);
                        toast({
                          title: "Copied!",
                          description: "Direct link copied to clipboard.",
                        });
                      }}
                      className="bg-neon-500 hover:bg-neon-600 text-black"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Embed Code */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Embed Code
                  </label>
                  <div className="flex items-start space-x-2">
                    <code className="flex-1 px-3 py-2 bg-midnight-900 border border-midnight-600 rounded text-sm text-gray-300 font-mono whitespace-pre-wrap">
{`<iframe 
  src="https://quotekit.ai/calc/${selectedCalculator.slug}" 
  width="100%" 
  height="600" 
  frameborder="0">
</iframe>`}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => {
                        const embedCode = `<iframe src="https://quotekit.ai/calc/${selectedCalculator.slug}" width="100%" height="600" frameborder="0"></iframe>`;
                        navigator.clipboard.writeText(embedCode);
                        toast({
                          title: "Copied!",
                          description: "Embed code copied to clipboard.",
                        });
                      }}
                      className="bg-neon-500 hover:bg-neon-600 text-black"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmbedModal(false)}
                    className="border-midnight-600 text-gray-300 hover:bg-midnight-800"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            Calculator added successfully!
          </div>
        )}
      </div>
    </div>
  );
}