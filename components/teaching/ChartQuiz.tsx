'use client'

import { useState } from 'react'

interface Choice {
  id: string
  label: string
  isCorrect: boolean
  explanation: string
}

interface ChartQuizProps {
  question: string
  scenario: string
  choices: Choice[]
  chartImageUrl?: string
  framework?: string   // e.g. "Wyckoff", "GEX", "ORB"
  difficulty?: 'intermediate' | 'advanced' | 'expert'
}

export default function ChartQuiz({
  question,
  scenario,
  choices,
  chartImageUrl,
  framework,
  difficulty = 'advanced',
}: ChartQuizProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const selectedChoice = choices.find(c => c.id === selected)
  const isCorrect = selectedChoice?.isCorrect ?? false

  const diffColor = {
    intermediate: 'var(--blue)',
    advanced: 'var(--gold)',
    expert: 'var(--red)',
  }[difficulty]

  const diffLabel = {
    intermediate: 'INTERMEDIATE',
    advanced: 'ADVANCED',
    expert: 'EXPERT',
  }[difficulty]

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-bright)',
      borderRadius: '12px',
      overflow: 'hidden',
      margin: '2rem 0',
      boxShadow: '0 0 40px rgba(201,168,76,0.08)',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
        padding: '0.875rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🎯</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            What Would You Do Here?
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {framework && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              padding: '0.2rem 0.5rem', borderRadius: 4, color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {framework}
            </span>
          )}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: diffColor, border: `1px solid ${diffColor}`,
            padding: '0.2rem 0.5rem', borderRadius: 4,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            {diffLabel}
          </span>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* Scenario */}
        <div style={{
          background: 'rgba(201,168,76,0.05)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}>
          <div style={{ color: 'var(--gold-dim)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            Scenario
          </div>
          {scenario}
        </div>

        {/* Chart image placeholder or actual image */}
        {chartImageUrl ? (
          <div style={{
            borderRadius: 8, overflow: 'hidden',
            border: '1px solid var(--border)',
            marginBottom: '1.25rem',
          }}>
            <img src={chartImageUrl} alt="Chart scenario" style={{ width: '100%', display: 'block' }} />
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-elevated)',
            border: '2px dashed var(--border)',
            borderRadius: 8,
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>📊</span>
            <span>TOS capture / annotated chart loads here</span>
          </div>
        )}

        {/* Question */}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.05rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '1rem',
          lineHeight: 1.4,
        }}>
          {question}
        </p>

        {/* Choices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {choices.map(choice => {
            const isSelected = selected === choice.id
            const showResult = revealed && isSelected

            let borderColor = 'var(--border)'
            let bgColor = 'var(--bg-elevated)'
            let textColor = 'var(--text-primary)'

            if (revealed && choice.isCorrect) {
              borderColor = 'var(--green)'
              bgColor = 'rgba(76,175,130,0.08)'
              textColor = 'var(--green)'
            } else if (showResult && !choice.isCorrect) {
              borderColor = 'var(--red)'
              bgColor = 'rgba(224,82,82,0.08)'
              textColor = 'var(--red)'
            } else if (isSelected) {
              borderColor = 'var(--gold)'
              bgColor = 'rgba(201,168,76,0.08)'
            }

            return (
              <button
                key={choice.id}
                onClick={() => !revealed && setSelected(choice.id)}
                disabled={revealed}
                style={{
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 8,
                  padding: '0.875rem 1.125rem',
                  cursor: revealed ? 'default' : 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  transition: 'all 0.2s',
                  width: '100%',
                }}
              >
                <span style={{
                  width: 22, height: 22,
                  borderRadius: '50%',
                  border: `1.5px solid ${borderColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                  color: textColor,
                  marginTop: 1,
                }}>
                  {revealed && choice.isCorrect ? '✓' : revealed && isSelected ? '✗' : choice.id.toUpperCase()}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: textColor, lineHeight: 1.5 }}>
                  {choice.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Submit / Result */}
        {!revealed ? (
          <button
            onClick={() => selected && setRevealed(true)}
            disabled={!selected}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.875rem',
              background: selected ? 'var(--gold)' : 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: selected ? 'var(--bg-primary)' : 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: selected ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >
            REVEAL ANSWER
          </button>
        ) : (
          <div style={{
            marginTop: '1rem',
            background: isCorrect ? 'rgba(76,175,130,0.08)' : 'rgba(224,82,82,0.08)',
            border: `1px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}`,
            borderRadius: 8,
            padding: '1rem 1.25rem',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: isCorrect ? 'var(--green)' : 'var(--red)',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}>
              {isCorrect ? '✓ CORRECT — ' : '✗ NOT QUITE — '}
              {selectedChoice?.label}
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}>
              {selectedChoice?.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
