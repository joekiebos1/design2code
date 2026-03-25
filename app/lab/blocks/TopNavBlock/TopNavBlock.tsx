'use client'

/**
 * Lab: TopNavBlock – mega menu experiment
 *
 * Ported from mega-menu-demo. Uses DS components and tokens only.
 * L1 click to open, L2/L3 hover/click, click-outside to close.
 * Mobile "Apps & Services" expand, Business L2 → L3 → L4/L5 product listings.
 */

import { useState, useRef, useEffect } from 'react'
import {
  Label,
  Button,
  Icon,
  IcChevronLeft,
  IcChevronRight,
  IcSearch,
  IcProfile,
} from '@marcelinodzn/ds-react'
import { createTransition } from '@marcelinodzn/ds-tokens'
import { useGridBreakpoint } from '../../../../lib/utils/use-grid-breakpoint'
import { LAB_TYPOGRAPHY_VARS, labStyleNavDense } from '../../../../lib/typography/block-typography'
import {
  L1_CONFIG,
  L2_CONFIG,
  BUSINESS_L2,
  MOBILE_APPS_SERVICES,
  type L2MainItem,
} from './megaMenuData'

function getNavLinkStyle(transition: string | undefined): React.CSSProperties {
  return {
    ...labStyleNavDense,
    color: 'var(--ds-color-text-medium)',
    fontFamily: 'var(--ds-font-family)',
    ...(transition && { transition }),
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
  }
}

function getNavLinkActiveStyle(base: React.CSSProperties): React.CSSProperties {
  return {
    ...base,
    color: 'var(--ds-color-surface-secondary)',
    fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
  }
}

function getNavTextLargeStyle(transition: string | undefined): React.CSSProperties {
  return {
    ...labStyleNavDense,
    fontFamily: 'var(--ds-font-family)',
    color: 'var(--ds-color-text-medium)',
    textDecoration: 'none',
    ...(transition && { transition }),
  }
}

function getNavTextSmallStyle(transition: string | undefined): React.CSSProperties {
  return {
    ...labStyleNavDense,
    fontFamily: 'var(--ds-font-family)',
    color: 'var(--ds-color-text-medium)',
    textDecoration: 'none',
    ...(transition && { transition }),
  }
}

function isL2MainItemObject(item: L2MainItem): item is { label: string; showArrow?: boolean } {
  return typeof item === 'object' && item !== null && 'label' in item
}

export function LabTopNavBlock() {
  const [openL1, setOpenL1] = useState<string | null>(null)
  const [mobileExpandedL2, setMobileExpandedL2] = useState<string | null>(null)
  const [businessHoverL2, setBusinessHoverL2] = useState<string | null>(null)
  const [businessHoverL3, setBusinessHoverL3] = useState<string | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { contentMaxL, isMobile, isTablet } = useGridBreakpoint()

  const navTransition = prefersReducedMotion ? undefined : createTransition('color', 's', 'transition', 'subtle')
  const navTextTransition = prefersReducedMotion ? undefined : createTransition(['color', 'transform'], 's', 'transition', 'subtle')
  const navLinkStyle = getNavLinkStyle(navTransition)
  const navLinkActiveStyle = getNavLinkActiveStyle(navLinkStyle)
  const navTextLargeStyle = getNavTextLargeStyle(navTextTransition)
  const navTextSmallStyle = getNavTextSmallStyle(navTextTransition)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenL1(null)
      }
    }
    if (openL1) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openL1])

  useEffect(() => {
    if (openL1 !== 'mobile') setMobileExpandedL2(null)
  }, [openL1])

  useEffect(() => {
    if (openL1 !== 'business') {
      setBusinessHoverL2(null)
      setBusinessHoverL3(null)
    }
  }, [openL1])

  const showHelpfulLinks =
    !(openL1 === 'business' && businessHoverL2 && businessHoverL3) &&
    !(openL1 === 'mobile' && mobileExpandedL2)

  const showBusinessProductPanel =
    openL1 === 'business' && businessHoverL2 && businessHoverL3

  const showMobileAppsPanel = openL1 === 'mobile' && mobileExpandedL2 === 'apps-services'

  const l2 = businessHoverL2 ? BUSINESS_L2.find((x) => x.id === businessHoverL2) : null
  const l3 = l2?.l3.find((x) => x.id === businessHoverL3)

  const headerPadding = isMobile ? 'var(--ds-grid-margin)' : 'var(--ds-spacing-l)'

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        fontFamily: 'var(--ds-font-family)',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Header bar */}
      <header
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid var(--ds-color-stroke-divider)',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: contentMaxL,
            width: '100%',
            margin: '0 auto',
            paddingLeft: headerPadding,
            paddingRight: headerPadding,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 'var(--ds-spacing-3xl)',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 'var(--ds-spacing-m)' : 'var(--ds-spacing-2xl)', minWidth: 0, flex: '1 1 0', overflow: 'hidden' }}>
            <a
              href="#"
              style={{
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                textDecoration: 'none',
              }}
            >
              <img src="/logo.png" alt="Jio" style={{ height: 'var(--ds-spacing-xl)', width: 'auto', flexShrink: 0 }} />
            </a>
            <nav style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 'var(--ds-spacing-xs)' : 'var(--ds-spacing-l)', minWidth: 0, flexWrap: 'wrap' }}>
              {L1_CONFIG.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOpenL1(openL1 === item.id ? null : item.id)}
                  style={{
                    ...(openL1 === item.id ? navLinkActiveStyle : navLinkStyle),
                    ...(isMobile ? { minHeight: 44, minWidth: 44, padding: 'var(--ds-spacing-s)' } : {}),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--ds-color-surface-secondary)'
                  }}
                  onMouseLeave={(e) => {
                    if (openL1 !== item.id) {
                      e.currentTarget.style.color = 'var(--ds-color-text-medium)'
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 'var(--ds-spacing-xs)' : 'var(--ds-spacing-m)', flexShrink: 0 }}>
            {!isMobile && (
              <>
                <a href="#" style={navTextSmallStyle}>
                  Support
                </a>
                <a href="#" style={navTextSmallStyle}>
                  Company
                </a>
              </>
            )}
            <Button
              appearance="secondary"
              contained={false}
              size="M"
              attention="low"
              aria-label="Search"
              style={{
                minWidth: isMobile ? 44 : 0,
                minHeight: isMobile ? 44 : undefined,
                padding: 'var(--ds-spacing-xs)',
              }}
            >
              <Icon asset={<IcSearch />} size="M" appearance="secondary" />
            </Button>
            <Button
              appearance="secondary"
              contained={false}
              size="M"
              attention="low"
              aria-label="Profile"
              style={{
                minWidth: isMobile ? 44 : 0,
                minHeight: isMobile ? 44 : undefined,
                padding: 'var(--ds-spacing-xs)',
              }}
            >
              <Icon asset={<IcProfile />} size="M" appearance="secondary" />
            </Button>
          </div>
        </div>
      </header>

      {/* Dropdown */}
      {openL1 && (
        <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '100%',
              zIndex: 50,
              backgroundColor: 'white',
              borderTop: '1px solid var(--ds-color-stroke-divider)',
              maxWidth: '100vw',
              overflowX: 'hidden',
              boxSizing: 'border-box',
            }}
        >
          <div
            style={{
              maxWidth: contentMaxL,
              width: '100%',
              margin: '0 auto',
              paddingLeft: headerPadding,
              paddingRight: headerPadding,
              paddingTop: 'var(--ds-spacing-3xl)',
              paddingBottom: 'var(--ds-spacing-2xl)',
              textAlign: 'left',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: 'var(--ds-spacing-2xl)',
              }}
            >
              {/* Left nav column */}
              <div style={{ textAlign: 'left' }}>
                {/* Mobile – main view */}
                {openL1 === 'mobile' && !mobileExpandedL2 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-s)' }}>
                    <li>
                      <a href="#" style={{ ...navTextLargeStyle, display: 'block' }}>
                        Discover Mobile
                      </a>
                    </li>
                    {(L2_CONFIG.mobile.mainItems as L2MainItem[]).map((item) => {
                      const label = isL2MainItemObject(item) ? item.label : item
                      const showArrow = isL2MainItemObject(item) && item.showArrow
                      const isAppsServices = label === 'Apps & Services'
                      return (
                        <li key={label}>
                          {isAppsServices ? (
                            <button
                              type="button"
                              onClick={() => setMobileExpandedL2('apps-services')}
                              style={{
                                ...navTextLargeStyle,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--ds-spacing-s)',
                                width: '100%',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                fontFamily: 'var(--ds-font-family)',
                              }}
                            >
                              {label}
                              {showArrow && (
                                <Icon asset={<IcChevronRight />} size="S" appearance="secondary" />
                              )}
                            </button>
                          ) : (
                            <a href="#" style={{ ...navTextLargeStyle, display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-s)' }}>
                              {label}
                              {showArrow && (
                                <Icon asset={<IcChevronRight />} size="S" appearance="secondary" />
                              )}
                            </a>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}

                {/* Mobile – Apps & Services expanded */}
                {openL1 === 'mobile' && mobileExpandedL2 === 'apps-services' && (
                  <div style={{ paddingRight: 'var(--ds-spacing-xl)' }}>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-s)' }}>
                      <li>
                        <a href="#" style={navTextLargeStyle}>
                          Discover Mobile
                        </a>
                      </li>
                      {(L2_CONFIG.mobile.mainItems as L2MainItem[]).map((item) => {
                        const label = isL2MainItemObject(item) ? item.label : item
                        const showArrow = isL2MainItemObject(item) && item.showArrow
                        const isAppsServices = label === 'Apps & Services'
                        return (
                          <li key={label}>
                            {isAppsServices ? (
                              <span
                                style={{
                                  ...navTextLargeStyle,
                                  color: 'var(--ds-color-surface-secondary)',
                                  fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--ds-spacing-s)',
                                }}
                              >
                                {label}
                                {showArrow && (
                                  <Icon asset={<IcChevronRight />} size="S" appearance="secondary" />
                                )}
                              </span>
                            ) : (
                              <a href="#" style={{ ...navTextLargeStyle, display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-s)' }}>
                                {label}
                                {showArrow && (
                                  <Icon asset={<IcChevronRight />} size="S" appearance="secondary" />
                                )}
                              </a>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                {/* Home */}
                {openL1 === 'home' && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-s)' }}>
                    <li>
                      <a href="#" style={{ ...navTextLargeStyle, display: 'block' }}>
                        Discover Home
                      </a>
                    </li>
                    {L2_CONFIG.home.mainItems.map((item) => {
                      const label = isL2MainItemObject(item) ? item.label : item
                      return (
                        <li key={label}>
                          <a href="#" style={{ ...navTextLargeStyle, display: 'block' }}>
                            {label}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {/* Business – L2 view */}
                {openL1 === 'business' && !businessHoverL2 && (
                  <div>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-s)' }}>
                      <li style={{ minHeight: 'var(--ds-spacing-l)', display: 'flex', alignItems: 'center' }}>
                        <a href="#" style={{ ...navTextLargeStyle, display: 'block' }}>
                          Discover Business
                        </a>
                      </li>
                      {BUSINESS_L2.map((l2Item) => (
                        <li key={l2Item.id}>
                          <button
                            type="button"
                            onClick={() => setBusinessHoverL2(l2Item.id)}
                            style={{
                              ...navTextLargeStyle,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--ds-spacing-s)',
                              width: '100%',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              fontFamily: 'var(--ds-font-family)',
                              color: businessHoverL2 === l2Item.id ? 'var(--ds-color-surface-secondary)' : undefined,
                            }}
                          >
                            {l2Item.label}
                            <Icon asset={<IcChevronRight />} size="S" appearance="secondary" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Business – L3 view (with back) */}
                {openL1 === 'business' && businessHoverL2 && (
                  <div style={{ paddingRight: 'var(--ds-spacing-xl)' }}>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-s)' }}>
                      <li style={{ minHeight: 'var(--ds-spacing-l)', display: 'flex', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setBusinessHoverL2(null)
                            setBusinessHoverL3(null)
                          }}
                          style={{
                            ...navTextLargeStyle,
                            padding: 0,
                            margin: 0,
                            border: 'none',
                            background: 'transparent',
                            display: 'flex',
                            cursor: 'pointer',
                            fontFamily: 'var(--ds-font-family)',
                          }}
                          aria-label="Back to Business menu"
                        >
                          <Icon asset={<IcChevronLeft />} size="S" appearance="secondary" />
                        </button>
                      </li>
                      <li>
                        <a
                          href="#"
                          style={{
                            ...navTextLargeStyle,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--ds-spacing-s)',
                          }}
                        >
                          Discover all {l2?.label}
                        </a>
                      </li>
                      {l2?.l3.map((l3Item) => (
                        <li key={l3Item.id}>
                          <button
                            type="button"
                            onClick={() =>
                              setBusinessHoverL3(businessHoverL3 === l3Item.id ? null : l3Item.id)
                            }
                            style={{
                              ...navTextLargeStyle,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--ds-spacing-s)',
                              width: '100%',
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              fontFamily: 'var(--ds-font-family)',
                              color:
                                businessHoverL3 === l3Item.id
                                  ? 'var(--ds-color-surface-secondary)'
                                  : undefined,
                              fontWeight:
                                businessHoverL3 === l3Item.id
                                  ? LAB_TYPOGRAPHY_VARS.weightMedium
                                  : undefined,
                            }}
                          >
                            {l3Item.label}
                            {l3Item.showArrow && (
                              <Icon asset={<IcChevronRight />} size="S" appearance="secondary" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Business product panel (L3 listings) */}
              {showBusinessProductPanel && l3?.listings?.length && (
                <div
                  style={{
                    gridColumn: isMobile ? '1' : 'span 3',
                    textAlign: 'left',
                    paddingLeft: isMobile ? 0 : 'var(--ds-spacing-xl)',
                    borderLeft: isMobile ? 'none' : '1px solid var(--ds-color-stroke-divider)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    maxHeight: '70vh',
                  }}
                >
                  <a
                    href="#"
                    style={{
                      ...navTextLargeStyle,
                      fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
                      display: 'block',
                      paddingBottom: 'var(--ds-spacing-l)',
                      marginBottom: 0,
                      borderBottom: '1px solid var(--ds-color-stroke-divider)',
                    }}
                  >
                    Discover all {l3.label}
                  </a>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {l3.listings.map((listing, idx) => (
                      <section
                        key={listing.title}
                        style={{
                          paddingTop: idx === 0 ? 'var(--ds-spacing-l)' : 'var(--ds-spacing-l)',
                          paddingBottom: 'var(--ds-spacing-l)',
                          borderTop: idx === 0 ? 'none' : '1px solid var(--ds-color-stroke-divider)',
                        }}
                      >
                        <a
                          href="#"
                          style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 'var(--ds-spacing-s)',
                            marginBottom: 'var(--ds-spacing-l)',
                            width: 'fit-content',
                            textDecoration: 'none',
                            fontFamily: 'var(--ds-font-family)',
                          }}
                        >
                          <span style={navTextLargeStyle}>{listing.title}</span>
                          <span style={{ ...navTextSmallStyle, color: 'var(--ds-color-text-low)' }}>
                            View all
                          </span>
                        </a>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                            gap: 'var(--ds-spacing-l) var(--ds-spacing-m)',
                          }}
                        >
                          {listing.products.map((p, i) => (
                            <div key={i}>
                              <a href="#" style={{ display: 'block', textDecoration: 'none', fontFamily: 'var(--ds-font-family)' }}>
                                <span style={navTextSmallStyle}>{p.title}</span>
                                {p.desc && (
                                  <span
                                    style={{
                                      ...navTextSmallStyle,
                                      display: 'block',
                                      marginTop: 'var(--ds-spacing-2xs)',
                                      color: 'var(--ds-color-text-low)',
                                    }}
                                  >
                                    {p.desc}
                                  </span>
                                )}
                              </a>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Apps & Services product panel */}
              {showMobileAppsPanel && MOBILE_APPS_SERVICES.listings?.length && (
                <div
                  style={{
                    gridColumn: isMobile ? '1' : 'span 3',
                    textAlign: 'left',
                    paddingLeft: isMobile ? 0 : 'var(--ds-spacing-xl)',
                    borderLeft: isMobile ? 'none' : '1px solid var(--ds-color-stroke-divider)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    maxHeight: '70vh',
                  }}
                >
                  <a
                    href="#"
                    style={{
                      ...navTextLargeStyle,
                      fontWeight: LAB_TYPOGRAPHY_VARS.weightMedium,
                      display: 'block',
                      paddingBottom: 'var(--ds-spacing-l)',
                      marginBottom: 0,
                      borderBottom: '1px solid var(--ds-color-stroke-divider)',
                    }}
                  >
                    Discover all {MOBILE_APPS_SERVICES.label}
                  </a>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {MOBILE_APPS_SERVICES.listings.map((listing, idx) => (
                      <section
                        key={listing.title}
                        style={{
                          paddingTop: idx === 0 ? 'var(--ds-spacing-l)' : 'var(--ds-spacing-l)',
                          paddingBottom: 'var(--ds-spacing-l)',
                          borderTop: idx === 0 ? 'none' : '1px solid var(--ds-color-stroke-divider)',
                        }}
                      >
                        {MOBILE_APPS_SERVICES.listings.length > 1 && (
                          <a
                            href="#"
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: 'var(--ds-spacing-s)',
                              marginBottom: 'var(--ds-spacing-l)',
                              width: 'fit-content',
                              textDecoration: 'none',
                              fontFamily: 'var(--ds-font-family)',
                            }}
                          >
                            <span style={navTextLargeStyle}>{listing.title}</span>
                            <span style={{ ...navTextSmallStyle, color: 'var(--ds-color-text-low)' }}>
                              View all
                            </span>
                          </a>
                        )}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                            gap: 'var(--ds-spacing-l)',
                          }}
                        >
                          {listing.products.map((p, i) => (
                            <div key={i}>
                              <a href="#" style={{ display: 'block', textDecoration: 'none', fontFamily: 'var(--ds-font-family)' }}>
                                <span style={navTextSmallStyle}>{p.title}</span>
                                {p.desc && (
                                  <span
                                    style={{
                                      ...navTextSmallStyle,
                                      display: 'block',
                                      marginTop: 'var(--ds-spacing-2xs)',
                                      color: 'var(--ds-color-text-low)',
                                    }}
                                  >
                                    {p.desc}
                                  </span>
                                )}
                              </a>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              )}

              {/* Helpful links column */}
              {showHelpfulLinks && (
                <div style={{ textAlign: 'left' }}>
                  <Label size="S" weight="low" color="low" as="h3" style={{ marginBottom: 'var(--ds-spacing-l)', fontFamily: 'var(--ds-font-family)' }}>
                    Helpful links
                  </Label>
                  {openL1 === 'mobile' && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-m)' }}>
                      {L2_CONFIG.mobile.helpfulLinks.map((label) => (
                        <li key={label}>
                          <a href="#" style={navTextSmallStyle}>
                            {label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  {openL1 === 'home' && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-m)' }}>
                      {L2_CONFIG.home.helpfulLinks.map((label) => (
                        <li key={label}>
                          <a href="#" style={navTextSmallStyle}>
                            {label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  {openL1 === 'business' && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-m)' }}>
                      {(businessHoverL2
                        ? l2?.helpfulLinks
                        : L2_CONFIG.business.helpfulLinks
                      )?.map((label) => (
                        <li key={label}>
                          <a href="#" style={navTextSmallStyle}>
                            {label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {!isMobile && <div style={{ gridColumn: 'span 2' }} />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
