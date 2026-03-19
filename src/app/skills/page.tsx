'use client'

import { useEffect, useState } from 'react'
import { Shell } from '@/components/layout/shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Save, Trash2, X } from 'lucide-react'
import type { Skill } from '@/lib/types'

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)

  // Form
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState('')
  const [category, setCategory] = useState('general')

  const fetchSkills = () => {
    fetch('/api/skills')
      .then(r => r.json())
      .then(data => setSkills(data.skills || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSkills() }, [])

  const resetForm = () => {
    setName('')
    setDescription('')
    setInstructions('')
    setCategory('general')
    setEditingSkill(null)
    setShowEditor(false)
  }

  const handleSave = async () => {
    if (!name || !instructions) return
    setSaving(true)
    try {
      if (editingSkill) {
        await fetch(`/api/skills/${editingSkill.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, instructions, category }),
        })
      } else {
        await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, instructions, category }),
        })
      }
      resetForm()
      fetchSkills()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/skills/${id}`, { method: 'DELETE' })
    fetchSkills()
  }

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill)
    setName(skill.name)
    setDescription(skill.description)
    setInstructions(skill.instructions)
    setCategory(skill.category)
    setShowEditor(true)
  }

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            ทักษะที่ reuse ได้ — assign ให้ agent ตัวไหนก็ได้
          </p>
          <Button onClick={() => { resetForm(); setShowEditor(true) }}>
            <Plus className="h-4 w-4 mr-1" /> เพิ่มทักษะ
          </Button>
        </div>

        {showEditor && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {editingSkill ? 'แก้ไขทักษะ' : 'สร้างทักษะใหม่'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">ชื่อทักษะ</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="เช่น: Forex Content Writer"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">หมวดหมู่</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="general">ทั่วไป</option>
                      <option value="content">คอนเทนต์</option>
                      <option value="analysis">วิเคราะห์</option>
                      <option value="automation">ออโตเมชัน</option>
                      <option value="finance">การเงิน</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">คำอธิบาย</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="อธิบายสั้น ๆ ว่าทักษะนี้ทำอะไร"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">คำสั่ง (Instructions)</label>
                  <textarea
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    placeholder="เขียนคำสั่งที่จะ inject เข้าไปใน system prompt ของ agent"
                    rows={6}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none font-mono"
                  />
                </div>
                <Button onClick={handleSave} disabled={saving || !name || !instructions}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {editingSkill ? 'บันทึก' : 'สร้างทักษะ'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map(skill => (
            <Card key={skill.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{skill.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{skill.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3 font-mono">
                  {skill.instructions}
                </p>
                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(skill)}>
                    แก้ไข
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(skill.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {skills.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground text-center py-8">
              ยังไม่มีทักษะ — กดปุ่ม &quot;เพิ่มทักษะ&quot; เพื่อสร้าง
            </p>
          )}
        </div>
      </div>
    </Shell>
  )
}
