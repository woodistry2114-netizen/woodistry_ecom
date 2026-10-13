import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Button({ children, to, onClick, light = false }) {
  const Tag = to ? Link : 'button'
  return <Tag to={to} onClick={onClick} className={`button ${light ? 'button-light' : ''}`}>{children}<ArrowRight size={15}/></Tag>
}
