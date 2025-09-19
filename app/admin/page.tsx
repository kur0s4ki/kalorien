'use client'

import { useState, useEffect } from 'react'
import { AdminProtection } from '@/components/AdminProtection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { AppConfig } from '@/lib/supabase'

export default function AdminPage() {
  const [configs, setConfigs] = useState<AppConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/config')
      if (response.ok) {
        const data = await response.json()
        setConfigs(data)

        // Initialize edited values
        const initialValues: Record<string, string> = {}
        data.forEach((config: AppConfig) => {
          initialValues[config.key] = config.value
        })
        setEditedValues(initialValues)
      } else {
        toast.error('Failed to fetch configurations')
      }
    } catch (error) {
      console.error('Error fetching configs:', error)
      toast.error('Failed to fetch configurations')
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (key: string, value: string) => {
    setSaving(key)
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      })

      if (response.ok) {
        toast.success('Configuration updated successfully')

        // Update the configs state
        setConfigs(prev => prev.map(config =>
          config.key === key
            ? { ...config, value, updated_at: new Date().toISOString() }
            : config
        ))
      } else {
        toast.error('Failed to update configuration')
      }
    } catch (error) {
      console.error('Error updating config:', error)
      toast.error('Failed to update configuration')
    } finally {
      setSaving(null)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const hasChanges = (key: string) => {
    const config = configs.find(c => c.key === key)
    return config && editedValues[key] !== config.value
  }

  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = []
    }
    acc[config.category].push(config)
    return acc
  }, {} as Record<string, AppConfig[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configurations...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminProtection>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Configuration</h1>
          <p className="text-gray-600">
            Manage your application settings and content. Changes take effect immediately.
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
            <Card key={category} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="capitalize">{category}</span>
                  <Badge variant="outline" className="text-xs">
                    {categoryConfigs.length} setting{categoryConfigs.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryConfigs.map((config, index) => (
                  <div key={config.key}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={config.key} className="text-sm font-medium text-gray-700">
                          {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                        {config.description && (
                          <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-1">
                          {config.key.includes('description') ? (
                            <Textarea
                              id={config.key}
                              value={editedValues[config.key] || ''}
                              onChange={(e) => handleInputChange(config.key, e.target.value)}
                              className="min-h-[80px]"
                              placeholder="Enter description..."
                            />
                          ) : (
                            <Input
                              id={config.key}
                              value={editedValues[config.key] || ''}
                              onChange={(e) => handleInputChange(config.key, e.target.value)}
                              placeholder="Enter value..."
                            />
                          )}
                        </div>

                        <Button
                          onClick={() => updateConfig(config.key, editedValues[config.key])}
                          disabled={saving === config.key || !hasChanges(config.key)}
                          variant={hasChanges(config.key) ? "default" : "outline"}
                          className={hasChanges(config.key) ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {saving === config.key ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Saving...
                            </div>
                          ) : hasChanges(config.key) ? (
                            'Save'
                          ) : (
                            'Saved'
                          )}
                        </Button>
                      </div>

                      <div className="text-xs text-gray-500">
                        Last updated: {new Date(config.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Usage Notes</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Changes are applied immediately across the application</li>
            <li>• The app title and description affect SEO and browser tabs</li>
            <li>• Page titles are displayed prominently on each respective page</li>
            <li>• Use clear, descriptive text for better user experience</li>
          </ul>
        </div>
        </div>
      </div>
    </AdminProtection>
  )
}