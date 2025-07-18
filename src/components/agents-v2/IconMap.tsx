import { 
  Bot, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  Users, 
  FileText, 
  Shield, 
  Zap,
  DollarSign,
  GraduationCap,
  Clock,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Download,
  Mail,
  Printer,
  Eye,
  HelpCircle,
  Sparkles,
  Target,
  TrendingUp,
  Lock,
  Globe,
  Smartphone,
  Building
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<any>> = {
  Bot,
  CheckCircle,
  Star,
  ArrowRight,
  Users,
  FileText,
  Shield,
  Zap,
  DollarSign,
  GraduationCap,
  Clock,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Download,
  Mail,
  Printer,
  Eye,
  HelpCircle,
  Sparkles,
  Target,
  TrendingUp,
  Lock,
  Globe,
  Smartphone,
  Building
}

interface IconProps {
  name: string
  className?: string
}

export const Icon = ({ name, className = "h-8 w-8" }: IconProps) => {
  const IconComponent = iconMap[name]
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return <div className={className} />
  }
  return <IconComponent className={className} />
} 