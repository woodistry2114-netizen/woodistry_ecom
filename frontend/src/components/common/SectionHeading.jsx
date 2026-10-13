import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SectionHeading({ eyebrow, title, action }) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action && <Link to={action.to}>{action.label} <ArrowRight size={14}/></Link>}</div>
}
