import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ThemeTestPage() {
  return (
    <div className="container max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-heading font-bold text-foreground">
          AMBER Theme System
        </h1>
        <p className="text-lg text-muted-foreground">
          Production-grade Light/Dark mode using next-themes + CSS variables
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Color Palette Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Sneller 2026 Color Palette</CardTitle>
            <CardDescription>
              All colors automatically adapt to light/dark mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-semibold">Primary</span>
              </div>
              <div className="h-12 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-secondary-foreground text-sm font-semibold">Secondary</span>
              </div>
              <div className="h-12 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground text-sm font-semibold">Accent</span>
              </div>
              <div className="h-12 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground text-sm font-semibold">Muted</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>UI Components</CardTitle>
            <CardDescription>
              All components use semantic theme tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Badge>Default Badge</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
          </CardContent>
        </Card>

        {/* Theme Instructions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>🎨 Theme System Features</CardTitle>
            <CardDescription>
              Professional-grade theming with next-themes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">✨ Smart Theme Toggle</h4>
                <p className="text-sm text-muted-foreground">
                  Click the theme button in TopBar to cycle: Light → Dark → System
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">🎯 Semantic Tokens</h4>
                <p className="text-sm text-muted-foreground">
                  All colors use semantic tokens like bg-background, text-foreground
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">⚡ Zero Flicker</h4>
                <p className="text-sm text-muted-foreground">
                  Hydration-safe with suppressHydrationWarning and proper SSR
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>🔧 Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">✅ Completed Implementation:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• next-themes@0.4.6 installed and configured</li>
                  <li>• CSS variables with HSL format for all brand colors</li>
                  <li>• Proper light/dark mode contrast ratios</li>
                  <li>• Removed custom localStorage theme logic from TopBar</li>
                  <li>• Updated all components to use semantic tokens</li>
                  <li>• ThemeProvider with attribute="class", defaultTheme="system"</li>
                  <li>• suppressHydrationWarning for zero-flicker experience</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}