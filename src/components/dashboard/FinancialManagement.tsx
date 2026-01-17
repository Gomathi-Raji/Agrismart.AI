import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Receipt,
  PiggyBank,
  Target,
  BarChart3,
  PieChartIcon,
  PieChart,
  Download
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod?: string;
}

interface Budget {
  id: string;
  category: string;
  plannedAmount: number;
  spentAmount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
}

interface FinancialManagementProps {
  userType?: "farmer" | "seller" | "admin";
}

export function FinancialManagement({ userType = "farmer" }: FinancialManagementProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "income",
      category: "Crop Sales",
      amount: 125000,
      description: "Wheat sold to local market",
      date: "2024-09-15",
      paymentMethod: "Cash"
    },
    {
      id: "2",
      type: "expense",
      category: "Fertilizers",
      amount: 25000,
      description: "NPK fertilizer purchase",
      date: "2024-09-10",
      paymentMethod: "Bank Transfer"
    },
    {
      id: "3",
      type: "expense",
      category: "Equipment",
      amount: 45000,
      description: "Tractor maintenance",
      date: "2024-09-05",
      paymentMethod: "Cash"
    },
    {
      id: "4",
      type: "income",
      category: "Government Subsidy",
      amount: 50000,
      description: "PM Kisan scheme payment",
      date: "2024-08-30",
      paymentMethod: "Direct Benefit Transfer"
    }
  ]);

  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: "1",
      category: "Fertilizers",
      plannedAmount: 100000,
      spentAmount: 25000,
      period: "monthly"
    },
    {
      id: "2",
      category: "Equipment",
      plannedAmount: 200000,
      spentAmount: 45000,
      period: "quarterly"
    },
    {
      id: "3",
      category: "Labor",
      plannedAmount: 150000,
      spentAmount: 0,
      period: "monthly"
    }
  ]);

  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: "expense",
    category: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: ""
  });
  const [newBudget, setNewBudget] = useState<Partial<Budget>>({
    category: "",
    plannedAmount: 0,
    spentAmount: 0,
    period: "monthly"
  });

  const incomeCategories = ["Crop Sales", "Livestock Sales", "Government Subsidy", "Equipment Rental", "Other Income"];
  const expenseCategories = ["Fertilizers", "Pesticides", "Equipment", "Labor", "Seeds", "Irrigation", "Transportation", "Other Expenses"];
  const paymentMethods = ["Cash", "Bank Transfer", "Cheque", "Digital Wallet", "Direct Benefit Transfer"];

  // Calculate financial metrics
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // Monthly data for charts
  const monthlyData = [
    { month: 'Jan', income: 150000, expenses: 80000 },
    { month: 'Feb', income: 180000, expenses: 95000 },
    { month: 'Mar', income: 120000, expenses: 70000 },
    { month: 'Apr', income: 200000, expenses: 110000 },
    { month: 'May', income: 160000, expenses: 85000 },
    { month: 'Jun', income: 190000, expenses: 100000 },
    { month: 'Jul', income: 140000, expenses: 75000 },
    { month: 'Aug', income: 170000, expenses: 90000 },
    { month: 'Sep', income: 125000, expenses: 65000 }
  ];

  // Expense breakdown for pie chart
  const expenseBreakdown = expenseCategories.map(category => {
    const amount = transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: category, value: amount };
  }).filter(item => item.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleAddTransaction = () => {
    if (newTransaction.type && newTransaction.category && newTransaction.amount && newTransaction.description) {
      const transaction: Transaction = {
        id: Date.now().toString(),
        type: newTransaction.type as Transaction['type'],
        category: newTransaction.category,
        amount: newTransaction.amount,
        description: newTransaction.description,
        date: newTransaction.date || new Date().toISOString().split('T')[0],
        paymentMethod: newTransaction.paymentMethod
      };
      setTransactions([...transactions, transaction]);
      setNewTransaction({
        type: "expense",
        category: "",
        amount: 0,
        description: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: ""
      });
      setIsTransactionDialogOpen(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setNewTransaction({ ...transaction });
  };

  const handleUpdateTransaction = () => {
    if (editingTransaction && newTransaction.type && newTransaction.category && newTransaction.amount) {
      setTransactions(transactions.map(t =>
        t.id === editingTransaction.id
          ? { ...t, ...newTransaction, type: newTransaction.type as Transaction['type'] }
          : t
      ));
      setEditingTransaction(null);
      setNewTransaction({
        type: "expense",
        category: "",
        amount: 0,
        description: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: ""
      });
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(transactions.filter(t => t.id !== transactionId));
  };

  const handleAddBudget = () => {
    if (newBudget.category && newBudget.plannedAmount) {
      const budget: Budget = {
        id: Date.now().toString(),
        category: newBudget.category,
        plannedAmount: newBudget.plannedAmount,
        spentAmount: newBudget.spentAmount || 0,
        period: newBudget.period as Budget['period'] || "monthly"
      };
      setBudgets([...budgets, budget]);
      setNewBudget({
        category: "",
        plannedAmount: 0,
        spentAmount: 0,
        period: "monthly"
      });
      setIsBudgetDialogOpen(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Financial Management
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                  <DialogDescription>
                    Record a new income or expense transaction with details and category.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="transaction-type">Type</Label>
                    <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value as Transaction['type'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="transaction-category">Category</Label>
                    <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(newTransaction.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="transaction-amount">Amount (₹)</Label>
                    <Input
                      id="transaction-amount"
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="transaction-description">Description</Label>
                    <Textarea
                      id="transaction-description"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="transaction-date">Date</Label>
                    <Input
                      id="transaction-date"
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select value={newTransaction.paymentMethod} onValueChange={(value) => setNewTransaction({ ...newTransaction, paymentMethod: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(method => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddTransaction} className="w-full">
                    Add Transaction
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Set Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Set Budget</DialogTitle>
                  <DialogDescription>
                    Create a budget for a specific category with planned amount and time period.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="budget-category">Category</Label>
                    <Select value={newBudget.category} onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budget-amount">Planned Amount (₹)</Label>
                    <Input
                      id="budget-amount"
                      type="number"
                      value={newBudget.plannedAmount}
                      onChange={(e) => setNewBudget({ ...newBudget, plannedAmount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget-period">Period</Label>
                    <Select value={newBudget.period} onValueChange={(value) => setNewBudget({ ...newBudget, period: value as Budget['period'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddBudget} className="w-full">
                    Set Budget
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Income</p>
                      <p className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Expenses</p>
                      <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-destructive" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Profit</p>
                      <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(netProfit)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                      <p className="text-2xl font-bold text-primary">{profitMargin.toFixed(1)}%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Financial Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-5 w-5 text-success" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{transaction.category}</h4>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(transaction.date).toLocaleDateString()}
                            {transaction.paymentMethod && (
                              <>
                                <span>•</span>
                                <span>{transaction.paymentMethod}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold ${
                          transaction.type === 'income' ? 'text-success' : 'text-destructive'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget) => {
                const percentage = budget.plannedAmount > 0 ? (budget.spentAmount / budget.plannedAmount) * 100 : 0;
                const isOverBudget = percentage > 100;

                return (
                  <Card key={budget.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{budget.category}</h4>
                        <Badge variant={isOverBudget ? "destructive" : "secondary"}>
                          {budget.period}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Spent: {formatCurrency(budget.spentAmount)}</span>
                          <span>Budget: {formatCurrency(budget.plannedAmount)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{percentage.toFixed(1)}% used</span>
                          <span>{isOverBudget ? 'Over budget' : 'Within budget'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="income" fill="#10b981" />
                    <Bar dataKey="expenses" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Transaction Dialog */}
        <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Modify transaction details including amount, category, and description.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-transaction-type">Type</Label>
                <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value as Transaction['type'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-transaction-category">Category</Label>
                <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(newTransaction.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-transaction-amount">Amount (₹)</Label>
                <Input
                  id="edit-transaction-amount"
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-transaction-description">Description</Label>
                <Textarea
                  id="edit-transaction-description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-transaction-date">Date</Label>
                <Input
                  id="edit-transaction-date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdateTransaction} className="w-full">
                Update Transaction
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}