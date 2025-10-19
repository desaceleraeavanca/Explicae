"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

export function CreateDialectDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [characteristics, setCharacteristics] = useState<string[]>([])
  const [currentCharacteristic, setCurrentCharacteristic] = useState("")
  const [exampleTopics, setExampleTopics] = useState<string[]>([])
  const [currentTopic, setCurrentTopic] = useState("")

  const addCharacteristic = () => {
    if (currentCharacteristic.trim()) {
      setCharacteristics([...characteristics, currentCharacteristic.trim()])
      setCurrentCharacteristic("")
    }
  }

  const removeCharacteristic = (index: number) => {
    setCharacteristics(characteristics.filter((_, i) => i !== index))
  }

  const addTopic = () => {
    if (currentTopic.trim()) {
      setExampleTopics([...exampleTopics, currentTopic.trim()])
      setCurrentTopic("")
    }
  }

  const removeTopic = (index: number) => {
    setExampleTopics(exampleTopics.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    // Save dialect logic here
    setOpen(false)
    // Reset form
    setName("")
    setDescription("")
    setCharacteristics([])
    setExampleTopics([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg lg:hidden" size="icon">
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Dialeto</DialogTitle>
          <DialogDescription>
            Defina um perfil personalizado de audiência para gerar analogias mais direcionadas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Dialeto *</Label>
            <Input
              id="name"
              placeholder="Ex: Executivos de Marketing"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva o perfil desta audiência..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Características da Comunicação</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Linguagem técnica moderada"
                value={currentCharacteristic}
                onChange={(e) => setCurrentCharacteristic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCharacteristic())}
              />
              <Button type="button" onClick={addCharacteristic} size="icon" variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {characteristics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {characteristics.map((char, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {char}
                    <button onClick={() => removeCharacteristic(index)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tópicos de Exemplo</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Estratégias de crescimento"
                value={currentTopic}
                onChange={(e) => setCurrentTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
              />
              <Button type="button" onClick={addTopic} size="icon" variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {exampleTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {exampleTopics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="gap-1">
                    {topic}
                    <button onClick={() => removeTopic(index)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!name || !description}>
            Criar Dialeto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
