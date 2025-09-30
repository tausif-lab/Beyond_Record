"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import
    {
        FileText,
        Download,
        Share2,
        Eye,
        Edit,
        Plus,
        Trash2,
        QrCode,
        User,
        Briefcase,
        Code,
        ArrowLeft,
        Link as LinkIcon,
        LockOpen,
        Lock
    } from "lucide-react"
import { authService } from "@/lib/auth"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

// Mock portfolio data (used for preview panel and initial state)
const mockPortfolioData = {
    personalInfo: {
        name: "John Student",
        email: "john.student@demo.com",
        phone: "(555) 123-4567",
        location: "San Francisco, CA",
        website: "https://johnstudent.dev",
        linkedin: "linkedin.com/in/johnstudent",
        github: "github.com/johnstudent",
        summary:
            "Computer Science student with a passion for full-stack development and machine learning. Experienced in building scalable web applications and contributing to open-source projects.",
    },
    education: [
        {
            id: "1",
            institution: "Demo University",
            degree: "Bachelor of Science in Computer Science",
            gpa: "3.75",
            startDate: "2021",
            endDate: "2025",
            achievements: ["Dean's List Fall 2023", "CS Department Scholarship"],
        },
    ],
    experience: [
        {
            id: "1",
            company: "Tech Startup Inc.",
            position: "Software Engineering Intern",
            startDate: "Jun 2023",
            endDate: "Aug 2023",
            description:
                "Developed and maintained React-based web applications, collaborated with cross-functional teams, and implemented new features that improved user engagement by 25%.",
            technologies: ["React", "Node.js", "PostgreSQL", "AWS"],
        },
        {
            id: "2",
            company: "University Research Lab",
            position: "Research Assistant",
            startDate: "Jan 2023",
            endDate: "Present",
            description:
                "Conducting research on machine learning algorithms for natural language processing. Published 2 papers and presented findings at academic conferences.",
            technologies: ["Python", "TensorFlow", "PyTorch", "Jupyter"],
        },
    ],
    projects: [
        {
            id: "1",
            name: "E-Commerce Platform",
            description:
                "Full-stack e-commerce application with user authentication, payment processing, and admin dashboard.",
            technologies: ["Next.js", "Stripe", "Prisma", "PostgreSQL"],
            github: "https://github.com/johnstudent/ecommerce",
            demo: "https://ecommerce-demo.vercel.app",
            image: "/project1.jpg",
        },
        {
            id: "2",
            name: "AI Chat Application",
            description: "Real-time chat application with AI-powered responses and sentiment analysis.",
            technologies: ["React", "Socket.io", "OpenAI API", "MongoDB"],
            github: "https://github.com/johnstudent/ai-chat",
            demo: "https://ai-chat-demo.vercel.app",
            image: "/project2.jpg",
        },
    ],
    skills: {
        technical: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "SQL", "Git"],
        frameworks: ["Next.js", "Express.js", "Django", "Spring Boot"],
        tools: ["VS Code", "Docker", "AWS", "Figma", "Postman"],
        databases: ["PostgreSQL", "MongoDB", "Redis"],
    },
    achievements: [
        {
            id: "1",
            title: "Hackathon Winner",
            organization: "University Tech Fair 2023",
            date: "Oct 2023",
            description: "First place in web development category",
        },
        {
            id: "2",
            title: "Open Source Contributor",
            organization: "React Community",
            date: "2023",
            description: "Contributed to React documentation and bug fixes",
        },
    ],
}

const portfolioTemplates = [
    {
        id: "modern",
        name: "Modern Professional",
        description: "Clean, minimalist design perfect for tech roles",
        preview: "/template-modern.jpg",
        color: "blue",
    },
    {
        id: "creative",
        name: "Creative Portfolio",
        description: "Vibrant design ideal for creative professionals",
        preview: "/template-creative.jpg",
        color: "purple",
    },
    {
        id: "academic",
        name: "Academic Focus",
        description: "Traditional layout suitable for academic positions",
        preview: "/template-academic.jpg",
        color: "green",
    },
]

export function PortfolioGenerator()
{
    const [_user] = useState(authService.getCurrentUser())
    const [selectedTemplate, setSelectedTemplate] = useState("modern")
    const [portfolioData, setPortfolioData] = useState(mockPortfolioData)
    const [activeTab, setActiveTab] = useState("overview")
    const [isEditing, setIsEditing] = useState(false)
    const [shareUrl, setShareUrl] = useState<string>("")
    const [isPublic, setIsPublic] = useState<boolean>(false)
    const [qrDataUrl, setQrDataUrl] = useState<string>("")
    const previewRef = useRef<HTMLDivElement>(null)
    const printRef = useRef<HTMLDivElement>(null)

    // Load portfolio data and meta
    useEffect(() =>
    {
        const loadPortfolio = async () =>
        {
            try
            {
                const token = localStorage.getItem('auth_token')
                const res = await fetch('/api/student/portfolio', {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : ''
                    },
                    credentials: 'include'
                })
                if (res.ok)
                {
                    const data = await res.json()
                    const p = data.portfolio
                    setShareUrl(p?.shareUrl || "")
                    setIsPublic(!!p?.isPublic)
                    setPortfolioData((prev) => ({
                        ...prev,
                        personalInfo: {
                            name: p?.personalInfo?.name || '',
                            email: p?.personalInfo?.email || '',
                            phone: p?.personalInfo?.phone || '',
                            location: p?.personalInfo?.location || '',
                            website: p?.personalInfo?.website || '',
                            linkedin: p?.personalInfo?.linkedin || '',
                            github: p?.personalInfo?.github || '',
                            summary: p?.personalInfo?.summary || ''
                        },
                        education: (p?.education || []).map((e: any, i: number) => ({
                            id: String(i + 1),
                            institution: e.institution,
                            degree: e.degree,
                            gpa: e.gpa,
                            startDate: e.startDate,
                            endDate: e.endDate,
                            achievements: e.achievements || []
                        })),
                        experience: (p?.experience || []).map((e: any, i: number) => ({
                            id: String(i + 1),
                            company: e.company,
                            position: e.position,
                            startDate: e.startDate,
                            endDate: e.endDate,
                            description: e.description,
                            technologies: e.technologies || []
                        })),
                        projects: (p?.projects || []).map((e: any, i: number) => ({
                            id: String(i + 1),
                            name: e.name,
                            description: e.description,
                            technologies: e.technologies || [],
                            github: e.github,
                            demo: e.demo,
                            image: e.image,
                        })),
                        skills: {
                            ...prev.skills,
                            technical: p?.skills?.technical || prev.skills.technical
                        }
                    }))
                }
            } catch (e)
            {
                console.error('Failed to load portfolio', e)
            }
        }
        loadPortfolio()
    }, [])

    const generateShareableUrl = async () =>
    {
        try
        {
            const token = localStorage.getItem('auth_token')
            const res = await fetch('/api/student/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                credentials: 'include',
                body: JSON.stringify({ action: 'generate_share_url' })
            })
            if (!res.ok) throw new Error('Failed to generate share URL')
            const data = await res.json()
            setShareUrl(`${window.location.origin}/portfolio/${data.shareUrl}`)
            return data.shareUrl
        } catch (e)
        {
            console.error(e)
            return ""
        }
    }

    const generateQRCode = async (url: string) =>
    {
        try
        {
            const dataUrl = await QRCode.toDataURL(url, { width: 256 })
            setQrDataUrl(dataUrl)
            return dataUrl
        } catch (e)
        {
            console.error('QR generation failed', e)
            return ""
        }
    }

    const handleDownloadPDF = async () =>
    {
        const target = printRef.current || previewRef.current
        if (!target) return

        // Create a temporary clone to fix color issues
        const clone = target.cloneNode(true) as HTMLElement
        clone.style.position = 'fixed'
        clone.style.top = '-9999px'
        clone.style.left = '-9999px'
        clone.style.background = '#ffffff'
        clone.style.color = '#000000'
        document.body.appendChild(clone)

        // Replace any problematic color styles with safe fallbacks
        const allElements = clone.getElementsByTagName('*')
        for (let i = 0; i < allElements.length; i++)
        {
            const el = allElements[i] as HTMLElement
            el.style.filter = 'none' // Remove filters that might use unsupported functions
            if (el.classList.contains('text-muted-foreground'))
            {
                el.style.color = '#6b7280'
            }
            if (el.classList.contains('bg-blue-600'))
            {
                el.style.backgroundColor = '#2563eb'
            }
            if (el.classList.contains('border'))
            {
                el.style.borderColor = '#d1d5db'
            }
        }

        try
        {
            const canvas = await html2canvas(clone, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                allowTaint: false
            })

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()

            const imgWidth = pageWidth
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            let position = 0
            let heightLeft = imgHeight

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight

            while (heightLeft > 0)
            {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
                heightLeft -= pageHeight
            }

            pdf.save('portfolio.pdf')
        } catch (error)
        {
            console.error('PDF export failed:', error)
            alert('PDF export failed. Please try again.')
        } finally
        {
            // Cleanup: remove the cloned element
            document.body.removeChild(clone)
        }
    }

    const handleExportHTML = () =>
    {
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolioData.personalInfo.name} - Portfolio</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section {
            background: white;
            margin-bottom: 20px;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #2563eb;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .experience-item, .project-item, .achievement-item {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        .experience-item:last-child, .project-item:last-child, .achievement-item:last-child {
            border-bottom: none;
        }
        .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }
        .tech-tag {
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
        }
        .links {
            margin-top: 10px;
        }
        .links a {
            color: #2563eb;
            text-decoration: none;
            margin-right: 15px;
        }
        .links a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${portfolioData.personalInfo.name}</h1>
        <p>${portfolioData.personalInfo.email}</p>
        <p>${portfolioData.personalInfo.summary}</p>
    </div>
    
    <div class="section">
        <h2>Experience</h2>
        ${portfolioData.experience.map(exp => `
        <div class="experience-item">
            <h3>${exp.position}</h3>
            <h4>${exp.company} | ${exp.startDate} - ${exp.endDate}</h4>
            <p>${exp.description}</p>
            <div class="tech-stack">
                ${exp.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
        </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>Projects</h2>
        ${portfolioData.projects.map(project => `
        <div class="project-item">
            <h3>${project.name}</h3>
            <p>${project.description}</p>
            <div class="tech-stack">
                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            <div class="links">
                ${project.github ? `<a href="${project.github}" target="_blank">GitHub</a>` : ''}
                ${project.demo ? `<a href="${project.demo}" target="_blank">Live Demo</a>` : ''}
            </div>
        </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>Achievements</h2>
        ${portfolioData.achievements.map(achievement => `
        <div class="achievement-item">
            <h3>${achievement.title}</h3>
            <h4>${achievement.organization} | ${achievement.date}</h4>
            <p>${achievement.description}</p>
        </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>Skills</h2>
        <h3>Technical Skills</h3>
        <div class="tech-stack">
            ${portfolioData.skills.technical.map(skill => `<span class="tech-tag">${skill}</span>`).join('')}
        </div>
    </div>
</body>
</html>
    `

        const blob = new Blob([htmlContent], { type: 'text/html' })
        saveAs(blob, `${portfolioData.personalInfo.name.replace(/\s+/g, '_')}_portfolio.html`)
    }

    const handleExportWord = async () =>
    {
        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            text: portfolioData.personalInfo.name,
                            heading: HeadingLevel.TITLE,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: portfolioData.personalInfo.email,
                                    italics: true,
                                }),
                            ],
                        }),
                        new Paragraph({
                            text: "",
                        }),
                        new Paragraph({
                            text: portfolioData.personalInfo.summary,
                        }),
                        new Paragraph({
                            text: "",
                        }),
                        new Paragraph({
                            text: "EXPERIENCE",
                            heading: HeadingLevel.HEADING_1,
                        }),
                        ...portfolioData.experience.flatMap(exp => [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: exp.position,
                                        bold: true,
                                    }),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `${exp.company} | ${exp.startDate} - ${exp.endDate}`,
                                        italics: true,
                                    }),
                                ],
                            }),
                            new Paragraph({
                                text: exp.description,
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `Technologies: ${exp.technologies.join(', ')}`,
                                        size: 18,
                                    }),
                                ],
                            }),
                            new Paragraph({
                                text: "",
                            }),
                        ]),
                        new Paragraph({
                            text: "PROJECTS",
                            heading: HeadingLevel.HEADING_1,
                        }),
                        ...portfolioData.projects.flatMap(project => [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: project.name,
                                        bold: true,
                                    }),
                                ],
                            }),
                            new Paragraph({
                                text: project.description,
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `Technologies: ${project.technologies.join(', ')}`,
                                        size: 18,
                                    }),
                                ],
                            }),
                            new Paragraph({
                                text: "",
                            }),
                        ]),
                        new Paragraph({
                            text: "ACHIEVEMENTS",
                            heading: HeadingLevel.HEADING_1,
                        }),
                        ...portfolioData.achievements.flatMap(achievement => [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: achievement.title,
                                        bold: true,
                                    }),
                                ],
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `${achievement.organization} | ${achievement.date}`,
                                        italics: true,
                                    }),
                                ],
                            }),
                            new Paragraph({
                                text: achievement.description,
                            }),
                            new Paragraph({
                                text: "",
                            }),
                        ]),
                        new Paragraph({
                            text: "TECHNICAL SKILLS",
                            heading: HeadingLevel.HEADING_1,
                        }),
                        new Paragraph({
                            text: portfolioData.skills.technical.join(' • '),
                        }),
                    ],
                },
            ],
        })

        const blob = await Packer.toBlob(doc)
        saveAs(blob, `${portfolioData.personalInfo.name.replace(/\s+/g, '_')}_portfolio.docx`)
    }

    const togglePublic = async () =>
    {
        try
        {
            const token = localStorage.getItem('auth_token')
            const res = await fetch('/api/student/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                credentials: 'include',
                body: JSON.stringify({ action: 'toggle_public' })
            })
            if (!res.ok) throw new Error('Failed to toggle visibility')
            const data = await res.json()
            setIsPublic(!!data.isPublic)
        } catch (e)
        {
            console.error(e)
        }
    }

    const handleSaveChanges = async () =>
    {
        try
        {
            const token = localStorage.getItem('auth_token')
            const res = await fetch('/api/student/portfolio', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                credentials: 'include',
                body: JSON.stringify({
                    portfolioData: {
                        personalInfo: portfolioData.personalInfo,
                        education: portfolioData.education,
                        experience: portfolioData.experience,
                        projects: portfolioData.projects,
                        achievements: portfolioData.achievements,
                        skills: portfolioData.skills
                    }
                })
            })

            if (res.ok)
            {
                setIsEditing(false)
                alert('Portfolio saved successfully!')
            } else
            {
                throw new Error('Failed to save portfolio')
            }
        } catch (error)
        {
            console.error('Save failed:', error)
            alert('Failed to save portfolio. Please try again.')
        }
    }

    const addNewItem = (section: string) =>
    {
        const newId = Date.now().toString()

        if (section === "experience")
        {
            setPortfolioData(prev => ({
                ...prev,
                experience: [...prev.experience, {
                    id: newId,
                    company: "New Company",
                    position: "New Position",
                    startDate: "2024",
                    endDate: "Present",
                    description: "Add your job description here...",
                    technologies: []
                }]
            }))
        } else if (section === "projects")
        {
            setPortfolioData(prev => ({
                ...prev,
                projects: [...prev.projects, {
                    id: newId,
                    name: "New Project",
                    description: "Add your project description here...",
                    technologies: [],
                    github: "",
                    demo: "",
                    image: ""
                }]
            }))
        } else if (section === "achievements")
        {
            setPortfolioData(prev => ({
                ...prev,
                achievements: [...prev.achievements, {
                    id: newId,
                    title: "New Achievement",
                    organization: "Organization",
                    date: "2024",
                    description: "Add achievement description here..."
                }]
            }))
        }
    }

    const removeItem = (section: string, id: string) =>
    {
        if (section === "experience")
        {
            setPortfolioData(prev => ({
                ...prev,
                experience: prev.experience.filter(item => item.id !== id)
            }))
        } else if (section === "projects")
        {
            setPortfolioData(prev => ({
                ...prev,
                projects: prev.projects.filter(item => item.id !== id)
            }))
        } else if (section === "achievements")
        {
            setPortfolioData(prev => ({
                ...prev,
                achievements: prev.achievements.filter(item => item.id !== id)
            }))
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Button variant="ghost" size="sm" asChild className="mr-4">
                                <a href="/dashboard/student">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </a>
                            </Button>
                            <FileText className="h-8 w-8 text-blue-600 mr-3" />
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Portfolio Generator</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button variant="outline" onClick={handleDownloadPDF}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                            <Button
                                variant="outline"
                                onClick={async () =>
                                {
                                    const urlSlug = await generateShareableUrl()
                                    const fullUrl = urlSlug ? `${window.location.origin}/portfolio/${urlSlug}` : shareUrl
                                    if (fullUrl) navigator.clipboard.writeText(fullUrl)
                                }}
                            >
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Link
                            </Button>
                            <Button onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                {isEditing ? "Save Changes" : "Edit Portfolio"}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hidden printable preview for PDF/QR export */}
                <div className="absolute -left-[9999px] top-0 w-[794px]" ref={printRef}>
                    <div className="border rounded-lg p-6 bg-white text-black">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">{portfolioData.personalInfo.name}</h2>
                            <p className="text-sm">{portfolioData.personalInfo.email}</p>
                            <p className="text-sm mt-2">{portfolioData.personalInfo.summary}</p>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Experience</h3>
                            <div className="space-y-2">
                                {portfolioData.experience.slice(0, 4).map((exp) => (
                                    <div key={exp.id} className="text-sm">
                                        <p className="font-medium">{exp.position}</p>
                                        <p className="text-muted-foreground">{exp.company}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Projects</h3>
                            <div className="space-y-2">
                                {portfolioData.projects.slice(0, 4).map((p) => (
                                    <div key={p.id} className="text-sm">
                                        <p className="font-medium">{p.name}</p>
                                        <p className="text-muted-foreground">{p.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="editor">Portfolio Editor</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                        <TabsTrigger value="share">Share & Export</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Portfolio Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="mr-2 h-5 w-5" />
                                        Portfolio Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Completion</span>
                                        <Badge variant="outline">85%</Badge>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Personal Info</span>
                                            <span className="text-green-600">✓ Complete</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Education</span>
                                            <span className="text-green-600">✓ Complete</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Experience</span>
                                            <span className="text-green-600">✓ Complete</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Projects</span>
                                            <span className="text-orange-600">⚠ Needs Review</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Skills</span>
                                            <span className="text-green-600">✓ Complete</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button className="w-full justify-start bg-transparent" variant="outline" onClick={() => setActiveTab('editor')}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Preview Portfolio
                                    </Button>
                                    <Button className="w-full justify-start bg-transparent" variant="outline" onClick={handleDownloadPDF}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download PDF
                                    </Button>
                                    <Button className="w-full justify-start bg-transparent" variant="outline" onClick={async () => { const slug = await generateShareableUrl(); if (slug) { const url = `${window.location.origin}/portfolio/${slug}`; setShareUrl(url); } }}>
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Generate Share Link
                                    </Button>
                                    <Button className="w-full justify-start bg-transparent" variant="outline" onClick={async () => { const url = shareUrl || (await generateShareableUrl().then(slug => slug ? `${window.location.origin}/portfolio/${slug}` : '')); if (url) await generateQRCode(url); }}>
                                        <QrCode className="mr-2 h-4 w-4" />
                                        Generate QR Code
                                    </Button>
                                    <Button className="w-full justify-start bg-transparent" variant="outline" onClick={togglePublic}>
                                        {isPublic ? <LockOpen className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
                                        {isPublic ? 'Make Private' : 'Make Public'}
                                    </Button>
                                    {shareUrl && (
                                        <div className="text-xs text-muted-foreground break-all flex items-center gap-2">
                                            <LinkIcon className="h-3 w-3" />
                                            <span>{shareUrl}</span>
                                        </div>
                                    )}
                                    {qrDataUrl && (
                                        <div className="flex justify-center pt-2">
                                            <img src={qrDataUrl} alt="QR Code" className="h-40 w-40" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Updates</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span>Added new project</span>
                                            <span className="text-muted-foreground">2 days ago</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Updated skills section</span>
                                            <span className="text-muted-foreground">1 week ago</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Changed template</span>
                                            <span className="text-muted-foreground">2 weeks ago</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="editor">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Editor Panel */}
                            <div className="space-y-6">
                                {/* Personal Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <User className="mr-2 h-5 w-5" />
                                                Personal Information
                                            </div>
                                            {isEditing && (
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    value={portfolioData.personalInfo.name}
                                                    disabled={!isEditing}
                                                    onChange={(e) =>
                                                        setPortfolioData((prev) => ({
                                                            ...prev,
                                                            personalInfo: { ...prev.personalInfo, name: e.target.value },
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    value={portfolioData.personalInfo.email}
                                                    disabled={!isEditing}
                                                    onChange={(e) =>
                                                        setPortfolioData((prev) => ({
                                                            ...prev,
                                                            personalInfo: { ...prev.personalInfo, email: e.target.value },
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="summary">Professional Summary</Label>
                                            <Textarea
                                                id="summary"
                                                value={portfolioData.personalInfo.summary}
                                                disabled={!isEditing}
                                                rows={4}
                                                onChange={(e) =>
                                                    setPortfolioData((prev) => ({
                                                        ...prev,
                                                        personalInfo: { ...prev.personalInfo, summary: e.target.value },
                                                    }))
                                                }
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Experience */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Briefcase className="mr-2 h-5 w-5" />
                                                Experience
                                            </div>
                                            {isEditing && (
                                                <Button variant="outline" size="sm" onClick={() => addNewItem("experience")}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {portfolioData.experience.map((exp) => (
                                            <div key={exp.id} className="border rounded-lg p-4 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium">{exp.position}</h4>
                                                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {exp.startDate} - {exp.endDate}
                                                        </p>
                                                    </div>
                                                    {isEditing && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeItem("experience", exp.id)}
                                                            className="text-red-600 hover:text-red-700 bg-transparent"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-sm">{exp.description}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {exp.technologies.map((tech) => (
                                                        <Badge key={tech} variant="secondary" className="text-xs">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Projects */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Code className="mr-2 h-5 w-5" />
                                                Projects
                                            </div>
                                            {isEditing && (
                                                <Button variant="outline" size="sm" onClick={() => addNewItem("projects")}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {portfolioData.projects.map((project) => (
                                            <div key={project.id} className="border rounded-lg p-4 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium">{project.name}</h4>
                                                        <p className="text-sm">{project.description}</p>
                                                    </div>
                                                    {isEditing && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeItem("projects", project.id)}
                                                            className="text-red-600 hover:text-red-700 bg-transparent"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {project.technologies.map((tech) => (
                                                        <Badge key={tech} variant="secondary" className="text-xs">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="flex space-x-2 text-sm">
                                                    <a href={project.github} className="text-blue-600 hover:underline">
                                                        GitHub
                                                    </a>
                                                    <a href={project.demo} className="text-blue-600 hover:underline">
                                                        Live Demo
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Achievements */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <User className="mr-2 h-5 w-5" />
                                                Achievements
                                            </div>
                                            {isEditing && (
                                                <Button variant="outline" size="sm" onClick={() => addNewItem("achievements")}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {portfolioData.achievements.map((achievement) => (
                                            <div key={achievement.id} className="border rounded-lg p-4 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium">{achievement.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{achievement.organization}</p>
                                                        <p className="text-xs text-muted-foreground">{achievement.date}</p>
                                                        <p className="text-sm mt-1">{achievement.description}</p>
                                                    </div>
                                                    {isEditing && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeItem("achievements", achievement.id)}
                                                            className="text-red-600 hover:text-red-700 bg-transparent"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Preview Panel */}
                            <div className="lg:sticky lg:top-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Eye className="mr-2 h-5 w-5" />
                                            Live Preview
                                        </CardTitle>
                                        <CardDescription>See how your portfolio will look</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div ref={previewRef} className="border rounded-lg p-6 bg-white dark:bg-gray-800 min-h-96">
                                            {/* Portfolio Preview */}
                                            <div className="space-y-6">
                                                <div className="text-center">
                                                    <h2 className="text-2xl font-bold">{portfolioData.personalInfo.name}</h2>
                                                    <p className="text-muted-foreground">{portfolioData.personalInfo.email}</p>
                                                    <p className="text-sm mt-2">{portfolioData.personalInfo.summary}</p>
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold mb-2">Experience</h3>
                                                    <div className="space-y-2">
                                                        {portfolioData.experience.slice(0, 2).map((exp) => (
                                                            <div key={exp.id} className="text-sm">
                                                                <p className="font-medium">{exp.position}</p>
                                                                <p className="text-muted-foreground">{exp.company}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold mb-2">Skills</h3>
                                                    <div className="flex flex-wrap gap-1">
                                                        {portfolioData.skills.technical.slice(0, 6).map((skill) => (
                                                            <Badge key={skill} variant="outline" className="text-xs">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="templates">
                        <Card>
                            <CardHeader>
                                <CardTitle>Choose a Template</CardTitle>
                                <CardDescription>Select a design template for your portfolio</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {portfolioTemplates.map((template) => (
                                        <div
                                            key={template.id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedTemplate === template.id
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                    : "hover:border-gray-300"
                                                }`}
                                            onClick={() => setSelectedTemplate(template.id)}
                                        >
                                            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                                                <img
                                                    src={template.preview || "/placeholder.svg?height=200&width=300&query=portfolio template"}
                                                    alt={template.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            </div>
                                            <h3 className="font-medium mb-2">{template.name}</h3>
                                            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                                            <div className="flex justify-between items-center">
                                                <Badge variant="outline" className={`text-${template.color}-600`}>
                                                    {template.color}
                                                </Badge>
                                                {selectedTemplate === template.id && (
                                                    <Badge variant="default" className="bg-blue-600">
                                                        Selected
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <Button>Apply Template</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="share">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Shareable Link */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="mr-2 h-5 w-5" />
                                        Shareable Link
                                    </CardTitle>
                                    <CardDescription>Share your portfolio with a public URL</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Input value={shareUrl} readOnly className="flex-1" />
                                        <Button
                                            variant="outline"
                                            onClick={async () =>
                                            {
                                                const url = shareUrl || await generateShareableUrl()
                                                if (url) {
                                                    navigator.clipboard.writeText(url)
                                                    alert("Link copied to clipboard!")
                                                }
                                            }}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" className="flex-1 bg-transparent">
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Share via Email
                                        </Button>
                                        <Button variant="outline" className="flex-1 bg-transparent">
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Share on LinkedIn
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* QR Code */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <QrCode className="mr-2 h-5 w-5" />
                                        QR Code
                                    </CardTitle>
                                    <CardDescription>Generate a QR code for easy sharing</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-center">
                                        <div className="w-48 h-48 border rounded-lg flex items-center justify-center bg-white">
                                            {qrDataUrl ? (
                                                <img src={qrDataUrl} alt="Portfolio QR Code" className="w-40 h-40 object-contain" />
                                            ) : (
                                                <div className="text-sm text-muted-foreground">No QR yet</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" className="flex-1 bg-transparent" onClick={async () => { const slug = await generateShareableUrl(); const url = slug ? `${window.location.origin}/portfolio/${slug}` : shareUrl; if (url) await generateQRCode(url); }}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Generate QR
                                        </Button>
                                        <Button variant="outline" className="flex-1 bg-transparent" onClick={handleDownloadPDF}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Export Options */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Download className="mr-2 h-5 w-5" />
                                        Export Options
                                    </CardTitle>
                                    <CardDescription>Download your portfolio in different formats</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={handleDownloadPDF}>
                                            <FileText className="h-8 w-8 mb-2" />
                                            <span>PDF Resume</span>
                                            <span className="text-xs text-muted-foreground">Professional format</span>
                                        </Button>
                                        <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={handleExportHTML}>
                                            <Code className="h-8 w-8 mb-2" />
                                            <span>HTML Export</span>
                                            <span className="text-xs text-muted-foreground">Standalone website</span>
                                        </Button>
                                        <Button variant="outline" className="h-20 flex-col bg-transparent" onClick={handleExportWord}>
                                            <FileText className="h-8 w-8 mb-2" />
                                            <span>Word Document</span>
                                            <span className="text-xs text-muted-foreground">Editable format</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
