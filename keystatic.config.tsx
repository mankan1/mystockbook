// keystatic.config.tsx
// This file defines your entire CMS — collections, fields, and UI.
// Access the editor at: http://localhost:3000/keystatic

import { config, collection, singleton, fields } from '@keystatic/core'
import { wrapper } from '@keystatic/core/content-components'

export default config({
  storage: {
    kind: 'github',
    repo: {
      owner: process.env.KEYSTATIC_GITHUB_REPO_OWNER ?? 'mankan1',
      name:  process.env.KEYSTATIC_GITHUB_REPO_NAME  ?? 'mystockbook',
    },
  },

  // ── UI Branding ─────────────────────────────────────────────────────────────
  ui: {
    brand: {
      name: 'Livermore Protocol CMS',
    },
    navigation: {
      Posts:   ['posts'],
      Data:    ['sessionDataset', 'tableOfContents'],
      Media:   ['tosCaptures'],
      Config:  ['siteSettings'],
    },
  },

  collections: {

    // ── Posts Collection ───────────────────────────────────────────────────────
    posts: collection({
      label: 'Posts / Chapters',
      slugField: 'title',
      path: 'content/posts/*',
      format: { contentField: 'content' },
      entryLayout: 'content',   // full-page editor
      schema: {

        title: fields.slug({
          name: { label: 'Title', validation: { isRequired: true } },
        }),

        date: fields.date({
          label: 'Publish Date',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),

        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Market Structure',      value: 'market-structure'  },
            { label: 'Pattern Analysis',      value: 'pattern-analysis'  },
            { label: 'Options Mechanics',     value: 'options-mechanics' },
            { label: 'Trade Execution',       value: 'trade-execution'   },
            { label: 'Chart Analysis',        value: 'chart-analysis'    },
            { label: 'Live Market Analysis',  value: 'live-analysis'     },
          ],
          defaultValue: 'chart-analysis',
        }),

        tier: fields.select({
          label: 'Access Tier',
          description: 'Free = visible to all. Subscriber = paywalled.',
          options: [
            { label: '🟢 Free',       value: 'free'       },
            { label: '🔒 Subscriber', value: 'subscriber' },
          ],
          defaultValue: 'free',
        }),

        status: fields.select({
          label: 'Status',
          options: [
            { label: '✏️  Draft',      value: 'draft'      },
            { label: '✅ Published',  value: 'published'  },
            { label: '🚧 In Progress',value: 'in-progress'},
          ],
          defaultValue: 'draft',
        }),

        excerpt: fields.text({
          label: 'Excerpt',
          description: 'One-paragraph summary shown on the table of contents and in metadata.',
          multiline: true,
          validation: { isRequired: true },
        }),

        readTime: fields.text({
          label: 'Read Time',
          description: 'e.g. "12 min"',
          defaultValue: '8 min',
        }),

        frameworks: fields.multiselect({
          label: 'Frameworks Used',
          description: 'Which analytical frameworks does this post teach?',
          options: [
            { label: 'Wyckoff',                   value: 'wyckoff'                   },
            { label: 'GEX / Dealer Flow',          value: 'gex'                       },
            { label: '0DTE Options Flow',          value: '0dte-flow'                 },
            { label: 'First-Hour Range / ORB',     value: 'orb'                       },
            { label: 'Sell-Off Clock',             value: 'sell-off-clock'            },
            { label: 'Candlestick & Price Action', value: 'price-action'              },
            { label: 'Volume Profile / VWAP',      value: 'vwap'                      },
            { label: 'Waiting Is a Position',      value: 'waiting-is-a-position'     },
          ],
        }),

        tags: fields.array(
          fields.text({ label: 'Tag' }),
          {
            label: 'Tags',
            itemLabel: props => props.value ?? '',
          }
        ),

        // The actual post content — MDX editor with component palette
        content: fields.mdx({
          label: 'Content',
          options: {
            image: {
              directory: 'public/post-images',
              publicPath: '/post-images/',
            },
          },
          components: {

            // ── Chart Components ───────────────────────────────────────────────

            ESLiveChart: wrapper({
              label: '📈 /ES Live Chart',
              description: 'TradingView Lightweight Chart — live /ES price feed',
              schema: {
                height: fields.number({
                  label: 'Height (px)',
                  defaultValue: 400,
                }),
                showVolume: fields.checkbox({
                  label: 'Show Volume',
                  defaultValue: true,
                }),
                annotation: fields.text({
                  label: '📌 Teaching Annotation',
                  description: 'Shown below the chart as a pinned note',
                  multiline: true,
                }),
              },
            }),

            OptionsPayoff: wrapper({
              label: '⚙️ Options Payoff Diagram',
              description: 'Interactive payoff chart for any options strategy',
              schema: {
                strategy: fields.select({
                  label: 'Strategy',
                  options: [
                    { label: 'Long Call',        value: 'long-call'        },
                    { label: 'Long Put',         value: 'long-put'         },
                    { label: 'Short Call',       value: 'short-call'       },
                    { label: 'Short Put',        value: 'short-put'        },
                    { label: 'Bear Call Spread', value: 'bear-call-spread' },
                    { label: 'Bull Put Spread',  value: 'bull-put-spread'  },
                    { label: 'Iron Condor',      value: 'iron-condor'      },
                    { label: 'Iron Butterfly',   value: 'iron-butterfly'   },
                    { label: 'Long Straddle',    value: 'long-straddle'    },
                    { label: 'Long Strangle',    value: 'long-strangle'    },
                  ],
                  defaultValue: 'bear-call-spread',
                }),
                shortStrike: fields.number({ label: 'Short Strike', defaultValue: 5480 }),
                longStrike:  fields.number({ label: 'Long Strike',  defaultValue: 5500 }),
                spot:        fields.number({ label: 'Current Spot Price', defaultValue: 5450 }),
                entry:       fields.number({ label: 'Entry Credit/Debit', defaultValue: 1.25 }),
                expiry:      fields.text({  label: 'Expiry Label', defaultValue: '0DTE' }),
                annotation:  fields.text({  label: '📌 Teaching Annotation', multiline: true }),
              },
            }),

            SellOffClock: wrapper({
              label: '⏱ Sell-Off Clock',
              description: 'The 5–7 session sell-off clock visualization',
              schema: {
                nextWindow:   fields.date({ label: 'Next Window Date', validation: { isRequired: true } }),
                confidence:   fields.number({ label: 'Confidence %', defaultValue: 87 }),
                lastSellOff:  fields.date({ label: 'Last Sell-Off Date' }),
              },
            }),

            GEXProfile: wrapper({
              label: '🏗️ GEX / Dealer Flow Profile',
              description: 'Gamma exposure profile with call/put walls',
              schema: {
                spot:      fields.number({ label: 'Spot Price',   defaultValue: 5420 }),
                callWall:  fields.number({ label: 'Call Wall',    defaultValue: 5500 }),
                putWall:   fields.number({ label: 'Put Wall',     defaultValue: 5350 }),
                zeroGamma: fields.number({ label: 'Zero Gamma',  defaultValue: 5400 }),
                title:     fields.text({  label: 'Chart Title',  defaultValue: 'GEX / Dealer Gamma Profile' }),
                annotation:fields.text({  label: '📌 Teaching Annotation', multiline: true }),
              },
            }),

            WyckoffPhase: wrapper({
              label: '📊 Wyckoff Schematic',
              description: 'Interactive accumulation or distribution schematic',
              schema: {
                mode: fields.select({
                  label: 'Schematic Type',
                  options: [
                    { label: 'Accumulation', value: 'accumulation' },
                    { label: 'Distribution', value: 'distribution' },
                  ],
                  defaultValue: 'accumulation',
                }),
                highlightEvents: fields.multiselect({
                  label: 'Highlight Events',
                  description: 'Which events to highlight in the schematic',
                  options: [
                    { label: 'PS — Preliminary Support',  value: 'PS'     },
                    { label: 'SC — Selling Climax',       value: 'SC'     },
                    { label: 'AR — Automatic Rally',      value: 'AR'     },
                    { label: 'ST — Secondary Test',       value: 'ST'     },
                    { label: 'Spring',                    value: 'Spring' },
                    { label: 'Test of Spring',            value: 'Test'   },
                    { label: 'SOS — Sign of Strength',    value: 'SOS'    },
                    { label: 'LPS — Last Point of Support',value: 'LPS'  },
                    { label: 'PSY — Preliminary Supply',  value: 'PSY'    },
                    { label: 'BC — Buying Climax',        value: 'BC'     },
                    { label: 'UT — Upthrust',             value: 'UT'     },
                    { label: 'UTAD',                      value: 'UTAD'   },
                    { label: 'SOW — Sign of Weakness',    value: 'SOW'    },
                    { label: 'LPSY',                      value: 'LPSY'   },
                  ],
                }),
                annotation: fields.text({ label: '📌 Teaching Annotation', multiline: true }),
              },
            }),

            TOSCapture: wrapper({
              label: '📷 TOS Chart Capture',
              description: 'Auto-updated ThinkOrSwim screenshot',
              schema: {
                chartName:  fields.select({
                  label: 'Chart',
                  options: [
                    { label: '/ES Daily',   value: 'es-daily'  },
                    { label: '/ES 5-min',   value: 'es-5min'   },
                    { label: '/ES 1-hour',  value: 'es-1hour'  },
                    { label: '/NQ Daily',   value: 'nq-daily'  },
                    { label: '/NQ 5-min',   value: 'nq-5min'   },
                  ],
                  defaultValue: 'es-daily',
                }),
                title:      fields.text({ label: 'Display Title' }),
                annotation: fields.text({ label: '📌 Teaching Annotation', multiline: true }),
              },
            }),

            // ── Teaching Components ────────────────────────────────────────────

            ChartQuiz: wrapper({
              label: '🎯 What Would You Do Here? Quiz',
              description: 'Interactive quiz for testing chart reading skills',
              schema: {
                framework: fields.select({
                  label: 'Framework',
                  options: [
                    { label: 'Wyckoff',           value: 'Wyckoff'           },
                    { label: 'GEX',               value: 'GEX'               },
                    { label: 'Sell-Off Clock',    value: 'Sell-Off Clock'    },
                    { label: 'ORB',               value: 'ORB'               },
                    { label: 'VWAP',              value: 'VWAP'              },
                    { label: 'Price Action',      value: 'Price Action'      },
                    { label: 'Options Flow',      value: 'Options Flow'      },
                    { label: 'Waiting Is a Position', value: 'Waiting Is a Position' },
                  ],
                  defaultValue: 'Wyckoff',
                }),
                difficulty: fields.select({
                  label: 'Difficulty',
                  options: [
                    { label: 'Intermediate', value: 'intermediate' },
                    { label: 'Advanced',     value: 'advanced'     },
                    { label: 'Expert',       value: 'expert'       },
                  ],
                  defaultValue: 'advanced',
                }),
                scenario: fields.text({
                  label: 'Scenario',
                  description: 'The market situation — time, price, context.',
                  multiline: true,
                  validation: { isRequired: true },
                }),
                question: fields.text({
                  label: 'Question',
                  validation: { isRequired: true },
                }),
                chartImageUrl: fields.image({
                  label: 'Chart Image (optional)',
                  directory: 'public/quiz-charts',
                  publicPath: '/quiz-charts/',
                }),
                choices: fields.array(
                  fields.object({
                    id: fields.select({
                      label: 'Choice ID',
                      options: [
                        { label: 'A', value: 'a' },
                        { label: 'B', value: 'b' },
                        { label: 'C', value: 'c' },
                        { label: 'D', value: 'd' },
                      ],
                      defaultValue: 'a',
                    }),
                    label: fields.text({
                      label: 'Choice Text',
                      validation: { isRequired: true },
                    }),
                    isCorrect: fields.checkbox({
                      label: 'This is the correct answer',
                      defaultValue: false,
                    }),
                    explanation: fields.text({
                      label: 'Explanation (shown after reveal)',
                      multiline: true,
                      validation: { isRequired: true },
                    }),
                  }),
                  {
                    label: 'Answer Choices',
                    itemLabel: props => `${props.fields.id.value.toUpperCase()}: ${props.fields.label.value.slice(0, 40)}...`,
                  }
                ),
              },
            }),

            AnnotatedChart: wrapper({
              label: '🔍 Annotated Chart Breakdown',
              description: 'Step-by-step chart with numbered teaching points',
              schema: {
                title:        fields.text({ label: 'Title', validation: { isRequired: true } }),
                description:  fields.text({ label: 'Description', multiline: true }),
                chartImageUrl: fields.image({
                  label: 'Chart Image',
                  directory: 'public/annotated-charts',
                  publicPath: '/annotated-charts/',
                }),
                annotations: fields.array(
                  fields.object({
                    id: fields.number({ label: 'Point Number', defaultValue: 1 }),
                    title: fields.text({ label: 'Point Title', validation: { isRequired: true } }),
                    category: fields.select({
                      label: 'Category',
                      options: [
                        { label: '▲ Entry',        value: 'entry'        },
                        { label: '▼ Exit',         value: 'exit'         },
                        { label: '⚠ Warning',      value: 'warning'      },
                        { label: '◆ Structure',    value: 'structure'    },
                        { label: '✓ Confirmation', value: 'confirmation' },
                      ],
                      defaultValue: 'structure',
                    }),
                    body: fields.text({
                      label: 'Teaching Explanation',
                      multiline: true,
                      validation: { isRequired: true },
                    }),
                  }),
                  {
                    label: 'Annotation Points',
                    itemLabel: props => `${props.fields.id.value}. ${props.fields.title.value}`,
                  }
                ),
              },
            }),

            VideoEmbed: wrapper({
              label: '🎬 Video Walkthrough',
              description: 'Embed YouTube, Loom, or direct video',
              schema: {
                url:         fields.url({ label: 'Video URL', validation: { isRequired: true } }),
                title:       fields.text({ label: 'Title' }),
                description: fields.text({ label: 'Description', multiline: true }),
                duration:    fields.text({ label: 'Duration', description: 'e.g. "12:34"' }),
                annotation:  fields.text({ label: '📌 Teaching Annotation', multiline: true }),
              },
            }),

          },
        }),
      },
    }),

    // ── TOS Captures Collection ────────────────────────────────────────────────
    tosCaptures: collection({
      label: 'TOS Chart Captures',
      slugField: 'name',
      path: 'public/tos-captures/meta/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({
          name: { label: 'Chart Name', description: 'e.g. es-daily, es-5min' },
        }),
        displayName: fields.text({ label: 'Display Name', defaultValue: '/ES Daily' }),
        symbol:      fields.text({ label: 'Symbol', defaultValue: '/ES' }),
        timeframe:   fields.select({
          label: 'Timeframe',
          options: [
            { label: '5 min',  value: '5'  },
            { label: '15 min', value: '15' },
            { label: '1 hour', value: '60' },
            { label: 'Daily',  value: 'D'  },
            { label: 'Weekly', value: 'W'  },
          ],
          defaultValue: 'D',
        }),
        // Manual upload fallback when cron isn't running
        manualCapture: fields.image({
          label: 'Manual Chart Upload',
          description: 'Upload a TOS screenshot manually. The cron job will override this during market hours.',
          directory: 'public/tos-captures',
          publicPath: '/tos-captures/',
        }),
        capturedAt: fields.text({
          label: 'Last Captured',
          description: 'Auto-filled by the Railway cron job. Leave blank for manual uploads.',
        }),
        notes: fields.text({
          label: 'Notes',
          description: 'Optional context about this chart (e.g. "Wyckoff spring visible at lows")',
          multiline: true,
        }),
      },
    }),
  },

  singletons: {

    // ── Table of Contents ──────────────────────────────────────────────────────
    tableOfContents: singleton({
      label: 'Table of Contents',
      path: 'data/table-of-contents',
      format: { data: 'json' },
      schema: {
        parts: fields.array(
          fields.object({
            part:        fields.text({ label: 'Part Number', description: 'e.g. I, II, III' }),
            title:       fields.text({ label: 'Part Title', validation: { isRequired: true } }),
            description: fields.text({ label: 'Part Description', multiline: true }),
            chapters: fields.array(
              fields.object({
                title:  fields.text({ label: 'Chapter Title', validation: { isRequired: true } }),
                slug:   fields.text({ label: 'Post Slug', description: 'Leave blank if not yet written' }),
                status: fields.select({
                  label: 'Status',
                  options: [
                    { label: '✅ Published',   value: 'published'   },
                    { label: '🚧 In Progress', value: 'in-progress' },
                    { label: '✏️  Draft',       value: 'draft'       },
                  ],
                  defaultValue: 'draft',
                }),
              }),
              {
                label: 'Chapters',
                itemLabel: props => props.fields.title.value || 'Untitled chapter',
              }
            ),
          }),
          {
            label: 'Book Parts',
            itemLabel: props => `Part ${props.fields.part.value}: ${props.fields.title.value}`,
          }
        ),
      },
    }),

    // ── 60-Session Dataset ─────────────────────────────────────────────────────
    sessionDataset: singleton({
      label: '60-Session Dataset',
      path: 'data/sessions',
      format: { data: 'json' },
      schema: {
        meta: fields.object({
          symbol:        fields.text({ label: 'Symbol', defaultValue: 'ES' }),
          period:        fields.text({ label: 'Period', defaultValue: 'Jan–Mar 2026' }),
          totalSessions: fields.number({ label: 'Total Sessions', defaultValue: 60 }),
          lastUpdated:   fields.date({ label: 'Last Updated', defaultValue: { kind: 'today' } }),
        }, { label: 'Dataset Info' }),

        sellOffClock: fields.object({
          intervalDays:     fields.array(
            fields.number({ label: 'Day' }),
            { label: 'Interval Range', description: 'Min and max days [5, 7]' }
          ),
          bounceRate:       fields.number({ label: 'Bounce Rate (0–1)', defaultValue: 1.0 }),
          avgBouncePercent: fields.number({ label: 'Avg Bounce %', defaultValue: 0.82 }),
          confirmedEvents:  fields.number({ label: 'Confirmed Events', defaultValue: 8 }),
          nextWindow:       fields.date({ label: 'Next Window Date' }),
          lastSellOff:      fields.date({ label: 'Last Sell-Off Date' }),
          confidence:       fields.number({ label: 'Confidence %', defaultValue: 87 }),
        }, { label: 'Sell-Off Clock' }),

        firstHourRange: fields.object({
          avgRange:         fields.number({ label: 'Avg Range (pts)', defaultValue: 18.4 }),
          medianRange:      fields.number({ label: 'Median Range (pts)', defaultValue: 16.2 }),
          breakoutHighRate: fields.number({ label: 'Breakout High Rate (0–1)', defaultValue: 0.68 }),
          breakoutLowRate:  fields.number({ label: 'Breakout Low Rate (0–1)', defaultValue: 0.71 }),
          rejectionRate:    fields.number({ label: 'Rejection Rate (0–1)', defaultValue: 0.29 }),
        }, { label: 'First-Hour Range Stats' }),

        gexLevels: fields.object({
          callWall:    fields.number({ label: 'Call Wall Strike', defaultValue: 5500 }),
          putWall:     fields.number({ label: 'Put Wall Strike',  defaultValue: 5350 }),
          zeroGamma:   fields.number({ label: 'Zero Gamma Level', defaultValue: 5420 }),
          majorSupport: fields.array(
            fields.number({ label: 'Strike' }),
            { label: 'Major Support Strikes' }
          ),
          majorResistance: fields.array(
            fields.number({ label: 'Strike' }),
            { label: 'Major Resistance Strikes' }
          ),
        }, { label: 'GEX Levels' }),
      },
    }),

    // ── Site Settings ──────────────────────────────────────────────────────────
    siteSettings: singleton({
      label: 'Site Settings',
      path: 'data/site-settings',
      format: { data: 'json' },
      schema: {
        title:       fields.text({ label: 'Site Title', defaultValue: 'The Livermore Protocol' }),
        tagline:     fields.text({ label: 'Tagline', defaultValue: 'A Trader\'s Field Manual' }),
        description: fields.text({ label: 'Meta Description', multiline: true }),
        subscribeUrl:fields.url({  label: 'Subscribe Page URL' }),
        stripeLink:  fields.url({  label: 'Stripe Payment Link' }),
        socialLinks: fields.object({
          twitter:  fields.url({ label: 'Twitter / X' }),
          youtube:  fields.url({ label: 'YouTube' }),
          substack: fields.url({ label: 'Substack' }),
        }, { label: 'Social Links' }),
        disclaimer: fields.text({
          label: 'Legal Disclaimer',
          defaultValue: 'For educational purposes only. Not financial advice.',
          multiline: true,
        }),
      },
    }),
  },
})
