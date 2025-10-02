"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { Profile, Chat } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageSquarePlus,
  Upload,
  ImageIcon,
  Video,
  Search,
  Mic,
  Send,
  Menu,
  Lock,
  Coins,
  MicOff,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ChatInterfaceProps {
  profile: Profile
  initialChats: Chat[]
  companySlug?: string
}

export default function ChatInterface({ profile, initialChats, companySlug }: ChatInterfaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [confidenteMode, setConfidenteMode] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [showRechargeDialog, setShowRechargeDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        chatId: currentChatId,
        companySlug,
      },
    }),
  })

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "es-ES"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("")

        setInputValue(transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("[v0] Speech recognition error:", event.error)
        setIsListening(false)
      }
    }
  }, [])

  const handleNewChat = async () => {
    const response = await fetch("/api/chats/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companySlug,
        mode: confidenteMode ? "confidente" : "normal",
      }),
    })

    if (response.ok) {
      const newChat = await response.json()
      setChats([newChat, ...chats])
      setCurrentChatId(newChat.id)
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || status === "in_progress") return

    sendMessage({ text: inputValue })
    setInputValue("")
  }

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta reconocimiento de voz")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload/file", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        sendMessage({ text: `He subido un archivo: ${file.name}. ${data.analysis}` })
      } else {
        alert("Error al subir el archivo")
      }
    } catch (error) {
      console.error("[v0] File upload error:", error)
      alert("Error al subir el archivo")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleGenerateImage = async () => {
    const prompt = window.prompt("Describe la imagen que quieres generar:")
    if (!prompt) return

    sendMessage({ text: `/generate-image ${prompt}` })
  }

  const handleGenerateVideo = async () => {
    const prompt = window.prompt("Describe el video que quieres generar:")
    if (!prompt) return

    sendMessage({ text: `/generate-video ${prompt}` })
  }

  const handleWebSearch = async () => {
    const query = window.prompt("¿Qué quieres buscar en la web?")
    if (!query) return

    sendMessage({ text: `/search ${query}` })
  }

  const displayCredits = profile.has_infinite_credits ? "∞" : profile.credits

  useEffect(() => {
    if (!profile.has_infinite_credits && profile.credits === 0) {
      setShowRechargeDialog(true)
    }
  }, [profile])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r bg-card transition-all duration-300",
          sidebarOpen ? "w-64" : "w-0 overflow-hidden",
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Chats</h2>
          <Button variant="ghost" size="icon" onClick={handleNewChat}>
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2 p-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setCurrentChatId(chat.id)}
                className={cn(
                  "w-full rounded-lg p-3 text-left text-sm transition-colors hover:bg-accent",
                  currentChatId === chat.id && "bg-accent",
                )}
              >
                <div className="flex items-center gap-2">
                  {chat.is_encrypted && <Lock className="h-3 w-3" />}
                  <span className="truncate">{chat.title}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Credits Display */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-[#00BFFF]" />
              <span>Créditos: {displayCredits}</span>
            </div>
            {!profile.has_infinite_credits && (
              <Button size="sm" variant="outline" onClick={() => setShowRechargeDialog(true)}>
                Recargar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">{companySlug === "newman" ? "Newman Bienes Raíces" : "Égida"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={confidenteMode ? "default" : "outline"}
              size="sm"
              onClick={() => setConfidenteMode(!confidenteMode)}
              className={cn(confidenteMode && "bg-[#00FF00] text-black hover:bg-[#00FF00]/90")}
            >
              <Lock className="mr-2 h-4 w-4" />
              Confidente
            </Button>
            {companySlug === "newman" && (
              <Link href="/newman/crm">
                <Button variant="outline" size="sm">
                  CRM
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <div className="space-y-2">
                  <Avatar className="mx-auto h-20 w-20">
                    <AvatarImage src="/yulia-avatar.png" alt="Yulia" />
                    <AvatarFallback>Y</AvatarFallback>
                  </Avatar>
                  <p className="text-lg font-medium">Hola, soy Yulia</p>
                  <p className="text-sm">¿En qué puedo ayudarte hoy?</p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/yulia-avatar.png" alt="Yulia" />
                    <AvatarFallback>Y</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    message.role === "user" ? "bg-[#00BFFF] text-white" : "bg-muted text-foreground",
                  )}
                >
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <p key={index} className="whitespace-pre-wrap leading-relaxed">
                          {part.text}
                        </p>
                      )
                    }
                    return null
                  })}
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{profile.first_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {status === "in_progress" && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/yulia-avatar.png" alt="Yulia" />
                  <AvatarFallback>Y</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:0.2s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/60 [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="mx-auto max-w-3xl space-y-3">
            {/* Tool Buttons */}
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Archivo
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerateImage}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Imagen
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerateVideo}>
                <Video className="mr-2 h-4 w-4" />
                Video
              </Button>
              <Button variant="outline" size="sm" onClick={handleWebSearch}>
                <Search className="mr-2 h-4 w-4" />
                Búsqueda
              </Button>
              <Button
                variant={isListening ? "default" : "outline"}
                size="sm"
                onClick={toggleVoiceInput}
                className={cn(isListening && "bg-[#00FF00] text-black hover:bg-[#00FF00]/90")}
              >
                {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                Voz
              </Button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe un mensaje..."
                disabled={status === "in_progress"}
                className="flex-1"
              />
              <Button type="submit" disabled={status === "in_progress" || !inputValue.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Recharge Credits Dialog */}
      <Dialog open={showRechargeDialog} onOpenChange={setShowRechargeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recarga de Créditos</DialogTitle>
            <DialogDescription>Selecciona tu empresa para recibir créditos</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              onValueChange={(value) => {
                if (value === "newman") {
                  alert("Newman te ha otorgado 333 créditos. Para sistema ilimitado, contacta con tu empresa.")
                  // In production, this would call an API to grant credits
                }
                setShowRechargeDialog(false)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newman">Newman Bienes Raíces</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/billing">
              <Button className="w-full bg-[#00BFFF] hover:bg-[#00BFFF]/90">Adquirir Sistema Ilimitado</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
