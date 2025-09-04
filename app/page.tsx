import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Database, Users, Zap, Shield, Search, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">InventoryPro</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            Professional Inventory Management
          </Badge>
          <h2 className="text-5xl font-bold text-balance mb-6 text-foreground">
            Manage Your Inventory with <span className="text-primary">Custom Templates</span>
          </h2>
          <p className="text-xl text-muted-foreground text-pretty mb-8 leading-relaxed">
            Create custom inventory templates, collaborate in real-time, and organize your items with powerful search
            and tagging. Perfect for businesses, teams, and personal organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                Browse Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">Everything You Need to Manage Inventory</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for modern inventory management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Database className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Custom Templates</CardTitle>
                <CardDescription>
                  Create reusable inventory templates with custom fields, validation rules, and formatting options.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Real-time Collaboration</CardTitle>
                <CardDescription>
                  Work together with your team using live discussions, auto-save, and instant updates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Search className="h-12 w-12 text-warning mb-4" />
                <CardTitle>Advanced Search</CardTitle>
                <CardDescription>
                  Find items instantly with powerful search, filtering, and tagging capabilities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-success mb-4" />
                <CardTitle>Role-based Access</CardTitle>
                <CardDescription>
                  Control who can view, edit, and manage your inventories with flexible permission system.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Custom ID Formats</CardTitle>
                <CardDescription>
                  Use your own ID formats and numbering systems to match your existing workflows.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Heart className="h-12 w-12 text-destructive mb-4" />
                <CardTitle>Community Features</CardTitle>
                <CardDescription>
                  Share templates, like inventories, and discover best practices from the community.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-4xl font-bold mb-6">Ready to Transform Your Inventory Management?</h3>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of businesses already using InventoryPro to streamline their operations.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-slate-300">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Database className="h-6 w-6" />
            <span className="text-lg font-semibold">InventoryPro</span>
          </div>
          <p className="text-sm">InventoryPro 2025</p>
        </div>
      </footer>
    </div>
  )
}
