import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home Page', () => {
  it('should render the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', {
      name: /Survei Kepuasan Masyarakat/i,
    })
    
    expect(heading).toBeInTheDocument()
  })

  it('should render the subtitle', () => {
    render(<Home />)
    
    const subtitle = screen.getAllByText(/Kelurahan Lebakgede/i)[0]
    
    expect(subtitle).toBeInTheDocument()
  })

  it('should render Start Survey link', () => {
    render(<Home />)
    
    const startLink = screen.getByRole('link', {
      name: /Mulai Isi Survei/i,
    })
    
    expect(startLink).toBeInTheDocument()
    expect(startLink).toHaveAttribute('href', '/form')
  })

  it('should not render Admin Dashboard link', () => {
    render(<Home />)
    
    const dashboardLink = screen.queryByRole('link', {
      name: /Admin Dashboard/i,
    })
    
    expect(dashboardLink).not.toBeInTheDocument()
  })

  it('should render feature cards', () => {
    render(<Home />)
    
    const quickCard = screen.getByText(/Quick & Easy/)
    const secureCard = screen.getByText(/Secure/)
    const impactfulCard = screen.getByText(/Impactful/)
    
    expect(quickCard).toBeInTheDocument()
    expect(secureCard).toBeInTheDocument()
    expect(impactfulCard).toBeInTheDocument()
  })

  it('should render footer with copyright', () => {
    render(<Home />)
    
    const currentYear = new Date().getFullYear()
    const footer = screen.getByText(new RegExp(`© ${currentYear}`))
    
    expect(footer).toBeInTheDocument()
  })
})
