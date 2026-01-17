import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, FileText, Users, Calendar, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SCHEMES = [
  {
    id: 1,
    title: "PM-KISAN",
    description: "Direct income support of ₹6,000 per year",
    category: "Subsidies",
    amount: "₹6,000/year",
    status: "active",
  },
  {
    id: 2,
    title: "Kisan Credit Card",
    description: "Easy credit facility for farmers",
    category: "Loans",
    amount: "Up to ₹3 Lakhs",
    status: "active",
  },
  {
    id: 3,
    title: "Crop Insurance",
    description: "Protection against crop loss",
    category: "Insurance",
    amount: "Premium subsidy",
    status: "active",
  },
];

export function GovernmentSchemesPreview() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground dark:text-foreground">🏛️ Government Schemes</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/government-schemes')}
          className="text-primary hover:text-primary/80"
        >
          View All
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-3 text-center">
            <DollarSign className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Subsidies</p>
            <p className="text-lg font-bold text-blue-600">25</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="p-3 text-center">
            <FileText className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Loans</p>
            <p className="text-lg font-bold text-green-600">18</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20">
          <CardContent className="p-3 text-center">
            <Users className="h-6 w-6 text-slate-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Insurance</p>
            <p className="text-lg font-bold text-slate-700">12</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="p-3 text-center">
            <Calendar className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Training</p>
            <p className="text-lg font-bold text-emerald-700">15</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {SCHEMES.map((scheme) => (
          <Card key={scheme.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/government-schemes')}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{scheme.title}</h3>
                    <Badge variant="secondary" className="text-xs">{scheme.category}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{scheme.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{scheme.amount}</Badge>
                    <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </Badge>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}