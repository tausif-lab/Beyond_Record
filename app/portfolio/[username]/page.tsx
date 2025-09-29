import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import dbConnect from "@/lib/mongodb"
import { Portfolio } from "@/lib/models"
import
    {
        User,
        Mail,
        Phone,
        MapPin,
        Globe,
        Github,
        Linkedin,
        ExternalLink,
        Download,
        Award,
        Code,
        Briefcase,
        GraduationCap,
    } from "lucide-react"

interface PortfolioPageProps
{
    params: {
        username: string
    }
}

export default async function PublicPortfolioPage({ params }: PortfolioPageProps)
{
    const { username } = params
    await dbConnect()
    const portfolio = await (Portfolio as any).findOne({ shareUrl: username, isPublic: true }).lean()

    if (!portfolio)
    {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Portfolio not found or not public.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={(portfolio as any).personalInfo?.avatar || "/placeholder.svg"} alt="Profile" />
                                <AvatarFallback>
                                    <User className="h-16 w-16" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold mb-2">{(portfolio as any).personalInfo?.name}</h1>
                                <p className="text-xl text-muted-foreground mb-4">{(portfolio as any).personalInfo?.title || ''}</p>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">{(portfolio as any).personalInfo?.summary}</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                                    <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2" />
                                        {(portfolio as any).personalInfo?.email}
                                    </div>
                                    {(portfolio as any).personalInfo?.phone && (
                                        <div className="flex items-center">
                                            <Phone className="h-4 w-4 mr-2" />
                                            {(portfolio as any).personalInfo?.phone}
                                        </div>
                                    )}
                                    {(portfolio as any).personalInfo?.location && (
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            {(portfolio as any).personalInfo?.location}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-center md:justify-start space-x-4 mt-4">
                                    {(portfolio as any).personalInfo?.website && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={(portfolio as any).personalInfo?.website} target="_blank" rel="noopener noreferrer">
                                                <Globe className="h-4 w-4 mr-2" />
                                                Website
                                            </a>
                                        </Button>
                                    )}
                                    {(portfolio as any).personalInfo?.github && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a
                                                href={`https://${(portfolio as any).personalInfo?.github}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Github className="h-4 w-4 mr-2" />
                                                GitHub
                                            </a>
                                        </Button>
                                    )}
                                    {(portfolio as any).personalInfo?.linkedin && (
                                        <Button variant="outline" size="sm" asChild>
                                            <a
                                                href={`https://${(portfolio as any).personalInfo?.linkedin}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Linkedin className="h-4 w-4 mr-2" />
                                                LinkedIn
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Button>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Resume
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Experience */}
                        {(portfolio as any).experience && (portfolio as any).experience.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Briefcase className="mr-2 h-5 w-5" />
                                        Experience
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {(portfolio as any).experience.map((exp: any, index: number) => (
                                        <div key={index} className="border-l-2 border-blue-200 pl-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold">{exp.position}</h3>
                                                    <p className="text-blue-600 font-medium">{exp.company}</p>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {exp.startDate} - {exp.endDate}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">{exp.description}</p>
                                            {exp.technologies && (
                                                <div className="flex flex-wrap gap-2">
                                                    {exp.technologies.map((tech: string) => (
                                                        <Badge key={tech} variant="secondary">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Projects */}
                        {(portfolio as any).projects && (portfolio as any).projects.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Code className="mr-2 h-5 w-5" />
                                        Featured Projects
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {(portfolio as any).projects.map((project: any, index: number) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-semibold text-lg">{project.name}</h3>
                                                <div className="flex space-x-2">
                                                    {project.github && (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={project.github} target="_blank" rel="noopener noreferrer">
                                                                <Github className="h-4 w-4 mr-1" />
                                                                Code
                                                            </a>
                                                        </Button>
                                                    )}
                                                    {project.demo && (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={project.demo} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                                Demo
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 mb-3">{project.description}</p>
                                            {project.technologies && (
                                                <div className="flex flex-wrap gap-2">
                                                    {project.technologies.map((tech: string) => (
                                                        <Badge key={tech} variant="outline">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Education */}
                        {(portfolio as any).education && (portfolio as any).education.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <GraduationCap className="mr-2 h-5 w-5" />
                                        Education
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {(portfolio as any).education.map((edu: any, index: number) => (
                                        <div key={index} className="space-y-2">
                                            <h3 className="font-semibold">{edu.degree}</h3>
                                            <p className="text-blue-600 font-medium">{edu.institution}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {edu.startDate} - {edu.endDate}
                                            </p>
                                            {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                                            {edu.achievements && (
                                                <div className="space-y-1">
                                                    {edu.achievements.map((achievement: string, i: number) => (
                                                        <p key={i} className="text-sm text-gray-600 dark:text-gray-300">
                                                            • {achievement}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Skills */}
                        {(portfolio as any).skills && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Technical Skills</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        {((portfolio as any).skills.technical || []).map((skill: string) => (
                                            <div key={skill} className="flex items-center">
                                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                                                <span className="text-sm">{skill}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Achievements */}
                        {(portfolio as any).education?.[0]?.achievements && (portfolio as any).education?.[0]?.achievements.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Award className="mr-2 h-5 w-5" />
                                        Achievements
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(portfolio as any).education[0].achievements.map((achievement: string, index: number) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium">{achievement}</h4>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-muted-foreground">
                    <p>Generated with Beyond Record</p>
                </div>
            </div>
        </div>
    )
}
