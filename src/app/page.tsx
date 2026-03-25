'use client'

import { useState, useEffect, useRef } from 'react'

interface ModalState {
  open: boolean
  titleFr: string
  titleEn: string
  descFr: string
  descEn: string
}

export default function Home() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const [modal, setModal] = useState<ModalState>({
    open: false,
    titleFr: '',
    titleEn: '',
    descFr: '',
    descEn: '',
  })

  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorOutlineRef = useRef<HTMLDivElement>(null)

  // Custom cursor
  useEffect(() => {
    const isTouchDevice =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(hover: none)').matches ||
      navigator.maxTouchPoints > 0
    if (isTouchDevice) return

    const dot = cursorDotRef.current
    const outline = cursorOutlineRef.current
    if (!dot || !outline) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`
    }

    document.addEventListener('mousemove', onMouseMove)

    let rafId: number
    const render = () => {
      outline.style.transform = `translate(${mouseX}px, ${mouseY}px)`
      rafId = requestAnimationFrame(render)
    }
    render()

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  // Scroll reveal via IntersectionObserver
  useEffect(() => {
    const reveals = document.querySelectorAll<HTMLElement>('.reveal')
    if (!('IntersectionObserver' in window) || !reveals.length) {
      reveals.forEach((el) => el.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.18 }
    )

    reveals.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  // ESC to close modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModal((prev) => ({ ...prev, open: false }))
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const openModal = (
    titleFr: string,
    titleEn: string,
    descFr: string,
    descEn: string
  ) => {
    setModal({ open: true, titleFr, titleEn, descFr, descEn })
  }

  const closeModal = () => {
    setModal((prev) => ({ ...prev, open: false }))
  }

  const modalTitle = lang === 'en' ? modal.titleEn : modal.titleFr
  const modalDesc = lang === 'en' ? modal.descEn : modal.descFr

  return (
    <div data-lang={lang}>
      {/* Fixed background gradient */}
      <div className="bg-container"></div>

      {/* Background orbs */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      {/* Custom cursor */}
      <div className="cursor-outline" ref={cursorOutlineRef}></div>
      <div className="cursor-dot" ref={cursorDotRef}></div>

      {/* Language switcher */}
      <div className="lang-switcher">
        <button
          type="button"
          data-lang-switch="fr"
          className={lang === 'fr' ? 'active' : ''}
          onClick={() => setLang('fr')}
        >
          FR
        </button>
        <div className="lang-switcher-separator"></div>
        <button
          type="button"
          data-lang-switch="en"
          className={lang === 'en' ? 'active' : ''}
          onClick={() => setLang('en')}
        >
          EN
        </button>
      </div>

      <main className="page">
        {/* Hero */}
        <header className="hero reveal">
          <div>
            <div className="badge">
              <span className="badge-dot"></span>
              <span className="lang-fr">Immersion • Atlas</span>
              <span className="lang-en">Immersion • Atlas</span>
            </div>
            <h1 className="hero-title">
              <span className="lang-fr">
                Immersion Atlas<br />
                <span className="hero-subtitle-inline">L&apos;intelligence centrale de vos projets immobiliers.</span>
              </span>
              <span className="lang-en">
                Immersion Atlas<br />
                <span className="hero-subtitle-inline">The intelligence layer behind your real estate projects.</span>
              </span>
            </h1>
            <p className="hero-subtitle">
              <span className="lang-fr">
                Atlas analyse chaque interaction dans Immersion pour comprendre vos acheteurs, aider vos équipes de vente et offrir aux promoteurs une lecture stratégique en temps réel de leurs projets.
              </span>
              <span className="lang-en">
                Atlas analyzes every interaction inside Immersion to understand buyers, support sales teams, and give developers a real-time strategic view of their projects.
              </span>
            </p>

            <div className="hero-pills">
              <div className="pill">
                <span className="pill-dot"></span>
                <span className="lang-fr">Intelligence commerciale temps réel</span>
                <span className="lang-en">Real-time sales intelligence</span>
              </div>
              <div className="pill">
                <span className="pill-dot"></span>
                <span className="lang-fr">Insights promoteurs &amp; pricing</span>
                <span className="lang-en">Developer &amp; pricing insights</span>
              </div>
              <div className="pill">
                <span className="pill-dot"></span>
                <span className="lang-fr">Visites assistées par l&apos;IA</span>
                <span className="lang-en">AI-assisted tours</span>
              </div>
              <div className="pill">
                <span className="pill-dot"></span>
                <span className="lang-fr">Voix &amp; texte&nbsp;: &quot;Dis Atlas…&quot;</span>
                <span className="lang-en">Voice &amp; text: &quot;Hey Atlas…&quot;</span>
              </div>
            </div>

            <div className="hero-meta">
              <div className="meta-item">
                <span className="lang-fr"><span>Pour qui&nbsp;:</span> Promoteurs, directions commerciales, équipes de vente</span>
                <span className="lang-en"><span>For:&nbsp;</span>Developers, sales leadership, on-site teams</span>
              </div>
              <div className="meta-item">
                <span className="lang-fr"><span>Intégré à&nbsp;:</span> Immersion (app et web)</span>
                <span className="lang-en"><span>Integrated into:&nbsp;</span>Immersion (app &amp; web)</span>
              </div>
            </div>

            <a href="#sales" className="scroll-indicator">
              <div className="scroll-indicator-icon">
                <div className="scroll-indicator-dot"></div>
              </div>
              <span className="lang-fr">Explorer la vision Atlas</span>
              <span className="lang-en">Explore the Atlas vision</span>
            </a>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-inner">
              <div className="hero-grid"></div>
              <div className="hero-label">
                <span className="lang-fr">Vue Atlas</span>
                <span className="lang-en">Atlas view</span>
                <span className="hero-label-tag lang-fr">Prototype conceptuel</span>
                <span className="hero-label-tag lang-en">Concept prototype</span>
              </div>
              <div className="hero-rings">
                <div className="ring r1"></div>
                <div className="ring r2"></div>
                <div className="ring r3"></div>
              </div>
              <div className="hero-metric-card">
                <div className="hero-metric">
                  <span className="title lang-fr">Score de probabilité</span>
                  <span className="title lang-en">Deal probability score</span>
                  <span className="value lang-fr">72% de chances de conversion</span>
                  <span className="value lang-en">72% likelihood to convert</span>
                  <span className="tag lang-fr">Basé sur comportement + intérêts</span>
                  <span className="tag lang-en">Based on behaviour &amp; interests</span>
                </div>
                <div className="hero-metric">
                  <span className="title lang-fr">Insight promoteur</span>
                  <span className="title lang-en">Developer insight</span>
                  <span className="value lang-fr">Unités 15xx sous-performantes</span>
                  <span className="value lang-en">15xx tier underperforming</span>
                  <span className="tag lang-fr">Recommandation : ajuster le pricing</span>
                  <span className="tag lang-en">Recommendation: adjust pricing</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Section nav */}
        <nav className="section-nav reveal">
          <a href="#sales" className="nav-pill">
            <span className="lang-fr">Intelligence commerciale</span>
            <span className="lang-en">Sales intelligence</span>
          </a>
          <a href="#buyer" className="nav-pill">
            <span className="lang-fr">Intelligence acheteur</span>
            <span className="lang-en">Buyer intelligence</span>
          </a>
          <a href="#promoter" className="nav-pill">
            <span className="lang-fr">Intelligence promoteur</span>
            <span className="lang-en">Developer intelligence</span>
          </a>
          <a href="#automation" className="nav-pill">
            <span className="lang-fr">Visites &amp; guidance IA</span>
            <span className="lang-en">Tours &amp; AI guidance</span>
          </a>
          <a href="#assistant" className="nav-pill">
            <span className="lang-fr">Assistant &quot;Dis Atlas…&quot;</span>
            <span className="lang-en">&quot;Hey Atlas…&quot; assistant</span>
          </a>
        </nav>

        {/* SALES INTELLIGENCE */}
        <section id="sales" className="section reveal">
          <header className="section-header">
            <div className="section-eyebrow">
              <span className="lang-fr">Bloc 01</span>
              <span className="lang-en">Block 01</span>
            </div>
            <h2 className="section-title">
              <span className="highlight lang-fr">Intelligence commerciale</span>
              <span className="highlight lang-en">Sales intelligence</span>
              <span className="lang-fr">— conclure plus souvent, avec moins de friction.</span>
              <span className="lang-en">— close more deals, with less friction.</span>
            </h2>
            <p className="section-tagline">
              <span className="lang-fr">Atlas transforme chaque visite en un signal exploitable pour vos équipes de vente.</span>
              <span className="lang-en">Atlas turns every visit into a clear, actionable signal for your sales teams.</span>
            </p>
          </header>

          <div className="section-grid">
            <div className="section-main">
              {/* Card: Deal probability */}
              <article
                className="card"
                onClick={() => openModal(
                  'Score de probabilité de vente',
                  'Deal probability scoring',
                  "Atlas calcule un score de probabilité de vente en combinant les données de navigation (durée de la visite, unités consultées, filtres appliqués) avec le contenu de la discussion et les réactions du client.<br><br>Ce score devient un indicateur simple et actionnable pour les équipes de vente : il permet de prioriser les leads les plus prometteurs, d'identifier rapidement les clients à relancer et de concentrer l'énergie là où l'impact commercial sera le plus fort.<br><br>Pour les directions commerciales, c'est un nouveau niveau de visibilité sur la qualité du pipeline, en temps réel.",
                  "Atlas calculates a deal probability score by combining navigation data (visit duration, units viewed, filters used) with what was said during the meeting and how the client reacted.<br><br>The result is a simple, actionable indicator for sales teams: they can prioritize the most promising leads, identify who to follow up with first, and focus their energy where impact will be highest.<br><br>For sales leadership, it's a new level of real-time visibility into pipeline quality."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Deal Probability Scoring</span>
                  <span className="lang-en">Deal Probability Scoring</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Score de probabilité de vente</span>
                  <span className="lang-en">Deal probability scoring</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Atlas agrège durée de visite, unités consultées, filtres, mots-clés et signaux émotionnels pour estimer, en temps réel, les chances de conversion d&apos;un acheteur.
                  </span>
                  <span className="lang-en">
                    Atlas combines visit duration, units viewed, filters, keywords and emotional signals to estimate, in real time, the likelihood of each buyer converting.
                  </span>
                </p>
                <ul className="card-list">
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Visualisation simple&nbsp;: <strong>&quot;Probabilité de conversion&nbsp;: 72%&quot;</strong>.</span>
                    <span className="lang-en">Simple visualization: <strong>&quot;Likelihood to convert: 72%.&quot;</strong></span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Priorisation automatique des leads chauds pour les équipes de vente.</span>
                    <span className="lang-en">Automatic prioritization of hot leads for your sales team.</span>
                  </li>
                </ul>
              </article>

              {/* Card: Follow-up */}
              <article
                className="card"
                onClick={() => openModal(
                  'Suivi automatisé et personnalisé',
                  'Automated, personalized follow-up',
                  "Après chaque visite, Atlas génère automatiquement un courriel de suivi structuré autour de ce qui a réellement compté pour le client : unités consultées, points d'intérêt, questions soulevées et objections discutées.<br><br>Le courtier conserve le contrôle : il révise, ajuste le ton au besoin, puis envoie. Mais 80 % du travail est déjà fait. Résultat : des suivis plus rapides, plus cohérents d'un client à l'autre et surtout, parfaitement alignés avec le parcours réel dans Immersion.<br><br>Pour le promoteur, cela se traduit par une meilleure expérience client et une diminution du risque de laisser glisser des opportunités chaudes faute de temps.",
                  "After each visit, Atlas automatically drafts a follow-up email built around what actually mattered to the client: units they explored, topics that triggered interest, questions they asked, and objections that came up.<br><br>The broker stays in control: they review, adjust the tone, and send. But 80% of the work is already done. The result: faster, more consistent follow-ups, perfectly aligned with the real visit inside Immersion.<br><br>For the developer, that means a smoother buyer experience and fewer hot opportunities lost due to lack of time."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Follow-up IA</span>
                  <span className="lang-en">AI Follow-up</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Suivi automatisé et personnalisé</span>
                  <span className="lang-en">Automated, personalized follow-up</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Après chaque visite, Atlas génère un courriel de suivi prêt à envoyer, aligné avec le parcours du client.
                  </span>
                  <span className="lang-en">
                    After each visit, Atlas generates a ready-to-send follow-up email, aligned with that client&apos;s journey in Immersion.
                  </span>
                </p>
                <ul className="card-list">
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Rappel des unités consultées et préférées.</span>
                    <span className="lang-en">Highlights the units they viewed and preferred.</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Réponses aux questions posées pendant la visite.</span>
                    <span className="lang-en">Covers the questions they asked during the visit.</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Propositions d&apos;alternatives et prochaines étapes (visite, réservation, documents).</span>
                    <span className="lang-en">Suggests alternatives and next steps (visit, reservation, documentation).</span>
                  </li>
                </ul>
              </article>
            </div>

            <aside className="section-side">
              {/* Card: Sales performance */}
              <article
                className="card"
                onClick={() => openModal(
                  'Analyse de performance des équipes de vente',
                  'Sales team performance insights',
                  "Atlas remplace les impressions subjectives par des indicateurs clairs sur la performance de chaque courtier : durée moyenne des visites, taux de conversion, fréquence des suivis et façon dont les clients réagissent à leurs présentations.<br><br>L'outil met aussi en lumière les approches qui fonctionnent le mieux : thématiques qui reviennent dans les visites qui se concluent, structure de présentation efficace, équilibre entre écoute et argumentaire.<br><br>Pour les gestionnaires, c'est une base solide pour du coaching ciblé, pour l'alignement des messages-clés et pour récompenser les bonnes pratiques.",
                  "Atlas replaces subjective impressions with clear indicators on each broker's performance: average visit duration, conversion rate, follow-up habits, and how clients actually respond to their presentations.<br><br>It also reveals the approaches that work best: topics that frequently show up in successful visits, presentation flows that convert, and the ideal balance between listening and talking.<br><br>For managers, it's a solid foundation for targeted coaching, messaging alignment, and rewarding best practices."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Performance</span>
                  <span className="lang-en">Performance</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Analyse de performance des équipes de vente</span>
                  <span className="lang-en">Sales team performance insights</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Atlas fournit une vision factuelle de la performance de chaque courtier, sans jugements subjectifs.
                  </span>
                  <span className="lang-en">
                    Atlas gives you a factual view of each broker&apos;s performance — without relying on gut feeling.
                  </span>
                </p>
                <ul className="card-list">
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Durée moyenne des visites &amp; taux de conversion.</span>
                    <span className="lang-en">Average visit duration &amp; conversion rates.</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Ratio parole / écoute et thématiques qui mènent à des ventes.</span>
                    <span className="lang-en">Talking / listening ratio, and topics that lead to a &quot;yes&quot;.</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Suggestions de coaching ciblées.</span>
                    <span className="lang-en">Targeted coaching suggestions for each broker.</span>
                  </li>
                </ul>
              </article>

              {/* Card: Recommendations */}
              <article
                className="card"
                onClick={() => openModal(
                  'Moteur de recommandations d\'unités',
                  'Unit recommendation engine',
                  "En analysant les critères exprimés par le client (budget, vue, typologie, style de vie) et le parcours réel dans Immersion, Atlas suggère au courtier les unités les plus pertinentes à présenter à chaque moment.<br><br>L'IA se comporte comme un co-pilote silencieux : elle met en avant des options qui respectent les contraintes du client tout en maximisant les chances de conversion (surfaces, expositions, étages, disponibilités réelles).<br><br>Pour le client, l'expérience devient plus fluide et ciblée. Pour le promoteur, cela aide à mieux répartir la demande sur l'ensemble de l'inventaire.",
                  "By combining the client's expressed criteria (budget, view, typology, lifestyle) with their actual journey inside Immersion, Atlas suggests the most relevant units to present at each step.<br><br>The AI behaves like a silent co-pilot: it surfaces options that respect constraints while maximizing conversion potential (layout, exposure, floor, real availability).<br><br>For the buyer, the experience feels curated and efficient. For the developer, demand is better balanced across the inventory."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Recommandations</span>
                  <span className="lang-en">Recommendations</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Moteur de recommandations d&apos;unités</span>
                  <span className="lang-en">Unit recommendation engine</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Atlas identifie en temps réel les unités les plus pertinentes selon le profil du visiteur.
                  </span>
                  <span className="lang-en">
                    Atlas identifies, in real time, the units that best match the buyer in front of you.
                  </span>
                </p>
                <p className="card-body" style={{ marginTop: '6px' }}>
                  <span className="lang-fr"><em>Exemple&nbsp;: &quot;Le client aime le 904 mais souhaite une vue ouest → recommander 1004 et 1104.&quot;</em></span>
                  <span className="lang-en"><em>Example: &quot;Client likes 904 but wants a western view → suggest 1004 and 1104.&quot;</em></span>
                </p>
              </article>
            </aside>
          </div>
        </section>

        {/* BUYER INTELLIGENCE */}
        <section id="buyer" className="section reveal">
          <header className="section-header">
            <div className="section-eyebrow">
              <span className="lang-fr">Bloc 02</span>
              <span className="lang-en">Block 02</span>
            </div>
            <h2 className="section-title">
              <span className="highlight lang-fr">Intelligence acheteur</span>
              <span className="highlight lang-en">Buyer intelligence</span>
              <span className="lang-fr">— comprendre vraiment qui se trouve devant vous.</span>
              <span className="lang-en">— truly understanding who&apos;s in front of you.</span>
            </h2>
            <p className="section-tagline">
              <span className="lang-fr">Atlas capte ce que les clients disent, font et ressentent pour personnaliser chaque présentation.</span>
              <span className="lang-en">Atlas captures what buyers say, do, and feel to personalize every presentation.</span>
            </p>
          </header>

          <div className="section-grid">
            <div className="section-main">
              {/* Card: Emotion analysis */}
              <article
                className="card"
                onClick={() => openModal(
                  'Analyse émotionnelle en temps réel',
                  'Real-time emotion analysis',
                  "Sans enregistrer d'image, Atlas analyse en local les expressions faciales pour détecter les moments de réel intérêt, de doute ou de retrait durant la visite.<br><br>Ces réactions sont ensuite synchronisées avec ce qui se passe à l'écran : une vue de balcon, une typologie trop serrée, un prix annoncé, une simulation d'ensoleillement… Le courtier obtient ainsi un retour objectif sur ce qui a réellement déclenché des émotions.<br><br>Pour le promoteur, ces données servent à valider les choix de design, d'architecture et de positionnement produit, en s'appuyant sur la réaction des acheteurs en situation réelle.",
                  "Without saving any image, Atlas locally analyzes facial expressions to detect moments of genuine interest, hesitation, or disengagement during the visit.<br><br>These reactions are then aligned with what was on screen: a balcony view, a tight floor plan, a price reveal, or a sunlight simulation. Brokers get objective feedback on the exact moments that triggered emotion.<br><br>For developers, this becomes powerful input to validate design, architecture and product positioning using real buyer reactions — not just opinions."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Emotion tracking</span>
                  <span className="lang-en">Emotion tracking</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Analyse émotionnelle en temps réel</span>
                  <span className="lang-en">Real-time emotion analysis</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Via la webcam (analyse locale, aucune image conservée), Atlas détecte les réactions clés et les associe à des moments précis de la visite.
                  </span>
                  <span className="lang-en">
                    Using the webcam (local analysis, no images stored), Atlas detects key reactions and links them to precise moments of the visit.
                  </span>
                </p>
                <ul className="card-list">
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Engouement sur les vues de balcon.</span>
                    <span className="lang-en">Excitement when seeing balcony views.</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Hésitation sur la taille de la cuisine ou le nombre de chambres.</span>
                    <span className="lang-en">Hesitation around kitchen size or bedroom count.</span>
                  </li>
                </ul>
                <div className="card-footer-note">
                  <span className="lang-fr">Chaque réaction devient un signal exploitable pour ajuster le discours en direct.</span>
                  <span className="lang-en">Every reaction becomes a signal to refine the pitch in real time.</span>
                </div>
              </article>

              {/* Card: Buyer intent */}
              <article
                className="card"
                onClick={() => openModal(
                  "Profil d'intention d'achat",
                  'Buyer intent profiling',
                  "À partir des questions posées, des filtres utilisés, des unités explorées et du langage employé par le client, Atlas déduit un profil d'intention d'achat : investisseur, famille, premier acheteur, haut de gamme, style de vie, etc.<br><br>Ce profil n'est pas un stéréotype abstrait : il est relié à des préférences concrètes : rendement, confort, image, flexibilité à long terme…<br><br>Résultat : le courtier peut adapter immédiatement son argumentaire, et le promoteur visualise la vraie composition de sa clientèle pour mieux ajuster son offre et ses futures phases.",
                  "Based on the questions asked, filters used, units explored, and language used by the buyer, Atlas infers a buyer intent profile: investor, family, first-time buyer, premium, lifestyle-driven, and more.<br><br>This isn't a vague persona — it's anchored in concrete preferences: return, comfort, image, long-term flexibility, etc.<br><br>The broker can instantly adapt their pitch, while the developer gets a clear picture of who is actually attracted to each project or phase."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Profilage</span>
                  <span className="lang-en">Profiling</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Profil d&apos;intention d&apos;achat</span>
                  <span className="lang-en">Buyer intent profiling</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    En croisant comportement et discours, Atlas catégorise automatiquement le type d&apos;acheteur.
                  </span>
                  <span className="lang-en">
                    By combining behaviour and conversation, Atlas automatically identifies the type of buyer in front of you.
                  </span>
                </p>
                <div className="chip-row">
                  <span className="chip">
                    <span className="lang-fr">Investisseur</span>
                    <span className="lang-en">Investor</span>
                  </span>
                  <span className="chip">
                    <span className="lang-fr">Famille</span>
                    <span className="lang-en">Family</span>
                  </span>
                  <span className="chip">
                    <span className="lang-fr">Premier acheteur</span>
                    <span className="lang-en">First-time buyer</span>
                  </span>
                  <span className="chip">
                    <span className="lang-fr">Haut de gamme</span>
                    <span className="lang-en">High-end</span>
                  </span>
                  <span className="chip">
                    <span className="lang-fr">Style de vie</span>
                    <span className="lang-en">Lifestyle</span>
                  </span>
                </div>
              </article>
            </div>

            <aside className="section-side">
              {/* Card: Needs extraction */}
              <article
                className="card"
                onClick={() => openModal(
                  'Extraction automatique des besoins',
                  'Automatic needs extraction',
                  "Pendant la visite, le client partage spontanément une foule d'informations : sa fourchette de budget, ses contraintes, ses préférences de vue, ses besoins de stationnement ou de rangement.<br><br>Atlas écoute, structure et transforme ces éléments en champs concrets : budget cible, plage de prix tolérée, priorités absolues, concessions possibles. Le tout est ensuite poussé automatiquement dans le CRM du projet.<br><br>Cela réduit la charge administrative des courtiers, évite les oublis ou approximations et garantit que chaque suivi s'appuie sur une compréhension précise des besoins réels du client.",
                  "During a visit, buyers naturally share a lot: budget range, constraints, preferred views, parking needs, storage concerns and more.<br><br>Atlas listens, structures and converts this into clean fields: target budget, price flexibility, must-haves, and nice-to-haves. Everything is then pushed automatically into the project CRM.<br><br>This reduces administrative burden for brokers, avoids forgotten details, and ensures every follow-up is grounded in what the client actually needs."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">CRM sync</span>
                  <span className="lang-en">CRM sync</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Extraction automatique des besoins</span>
                  <span className="lang-en">Automatic needs extraction</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Budget, vue souhaitée, nombre de chambres, besoin de stationnement, contraintes particulières…
                  </span>
                  <span className="lang-en">
                    Budget, preferred view, bedroom count, parking needs, specific constraints…
                  </span>
                </p>
                <p className="card-body" style={{ marginTop: '6px' }}>
                  <span className="lang-fr">
                    Atlas extrait ces informations de la transcription et du comportement, puis les inscrit directement dans le CRM du projet, sans effort supplémentaire pour le courtier.
                  </span>
                  <span className="lang-en">
                    Atlas extracts these details from the transcript and behaviour, then writes them directly into your CRM — without extra work for the sales team.
                  </span>
                </p>
              </article>
            </aside>
          </div>
        </section>

        {/* PROMOTER / DEVELOPER INTELLIGENCE */}
        <section id="promoter" className="section reveal">
          <header className="section-header">
            <div className="section-eyebrow">
              <span className="lang-fr">Bloc 03</span>
              <span className="lang-en">Block 03</span>
            </div>
            <h2 className="section-title">
              <span className="highlight lang-fr">Intelligence promoteur</span>
              <span className="highlight lang-en">Developer intelligence</span>
              <span className="lang-fr">— piloter vos projets avec une clarté nouvelle.</span>
              <span className="lang-en">— steering your projects with new clarity.</span>
            </h2>
            <p className="section-tagline">
              <span className="lang-fr">Atlas donne enfin aux promoteurs une vision consolidée et actionnable de la demande réelle.</span>
              <span className="lang-en">Atlas finally gives developers a consolidated, actionable view of real demand.</span>
            </p>
          </header>

          <div className="section-grid">
            <div className="section-main">
              {/* Card: Heatmap */}
              <article
                className="card"
                onClick={() => openModal(
                  'Carte thermique des comportements',
                  'Behaviour heatmap',
                  "La carte thermique Atlas traduit des milliers de visites en une vision simple : quelles unités attirent l'attention, lesquelles sont ignorées et quels attributs déclenchent véritablement l'intérêt (vue, étage, orientation, typologie, surfaces, etc.).<br><br>Plutôt que de se fier uniquement aux impressions des équipes, le promoteur accède à une photographie objective de la demande, projet par projet, phase par phase.<br><br>Ce niveau de granularité permet de mieux préparer les phases suivantes, d'ajuster les plans d'unités et d'anticiper les zones de tension : unités qui partiront très vite, ou au contraire, qui risquent de traîner.",
                  "Atlas' heatmap translates thousands of visits into a simple view: which units draw attention, which are ignored, and which attributes actually drive interest (view, floor, orientation, typology, size, and more).<br><br>Instead of relying solely on feedback from the field, developers get an objective picture of demand — project by project, phase by phase.<br><br>This level of granularity helps you prepare future phases, adjust floor plans, and anticipate pressure points: units that will sell instantly, and those that might lag behind."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Comportement</span>
                  <span className="lang-en">Behaviour</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Carte thermique des comportements</span>
                  <span className="lang-en">Behaviour heatmap</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Visualisez, en un coup d&apos;œil, ce qui capte l&apos;attention et ce qui reste ignoré.
                  </span>
                  <span className="lang-en">
                    See, at a glance, what attracts attention — and what gets ignored.
                  </span>
                </p>
                <ul className="card-list">
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Unités les plus consultées vs. unités invisibles.</span>
                    <span className="lang-en">Most-viewed units vs. units that remain invisible.</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Caractéristiques qui déclenchent des réactions positives : vues, étages, finitions, typologies.</span>
                    <span className="lang-en">Features that trigger strong reactions: views, floors, finishes, typologies.</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Compréhension fine de la demande avant même l&apos;ouverture officielle des ventes.</span>
                    <span className="lang-en">A precise read on demand, even before official launch.</span>
                  </li>
                </ul>
              </article>

              {/* Card: Pricing suggestions */}
              <article
                className="card"
                onClick={() => openModal(
                  "Suggestions d'optimisation des prix",
                  'Pricing optimization suggestions',
                  "En croisant l'intérêt généré par chaque unité (nombre de visites, temps passé, retours verbaux) avec son statut réel (réservée, en option, encore disponible), Atlas repère les incohérences de positionnement.<br><br>Certaines unités sont sur-consultées mais jamais réservées : le signal est fort qu'un frein existe, souvent lié au prix ou à un détail produit. D'autres, au contraire, se vendent extrêmement vite : elles auraient pu être mieux valorisées.<br><br>Plutôt que d'ajuster à l'aveugle, le promoteur dispose de recommandations concrètes pour optimiser les prix et la structure d'offre par typologie.",
                  "By combining interest for each unit (visits, time spent, spoken feedback) with its actual status (reserved, on hold, still available), Atlas spots pricing inconsistencies.<br><br>Some units are over-viewed but never reserved: a strong signal that something—often pricing or product positioning—is off. Others sell almost instantly: a sign that they could have been valued higher.<br><br>Instead of adjusting blindly, the developer gets concrete recommendations to optimize pricing and offering by typology."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Pricing</span>
                  <span className="lang-en">Pricing</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Suggestions d&apos;optimisation des prix</span>
                  <span className="lang-en">Pricing optimization suggestions</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Atlas détecte les unités sur-demandées mais non réservées, ainsi que celles surévaluées ou sous-évaluées.
                  </span>
                  <span className="lang-en">
                    Atlas detects over-demanded units that never convert, as well as those over- or under-priced.
                  </span>
                </p>
                <p className="card-body" style={{ marginTop: '6px' }}>
                  <span className="lang-fr">
                    <em>Exemple&nbsp;: &quot;L&apos;unité 1503 est 4× plus consultée que ses comparables, mais jamais réservée → revoir le prix ou le positionnement.&quot;</em>
                  </span>
                  <span className="lang-en">
                    <em>Example: &quot;Unit 1503 is viewed 4× more than its peers yet never reserved → revisit pricing or positioning.&quot;</em>
                  </span>
                </p>
              </article>
            </div>

            <aside className="section-side">
              {/* Card: Marketing attribution */}
              <article
                className="card"
                onClick={() => openModal(
                  'Attribution marketing pilotée par l\'IA',
                  'AI-driven marketing attribution',
                  "Atlas relie les visites qualifiées et les réservations à leurs canaux d'origine : campagnes numériques, infolettres, réseaux sociaux, référencement, évènements, etc.<br><br>Plutôt que de simplement mesurer le trafic, l'outil met en avant la qualité des leads par source : quel canal amène des visiteurs réellement engagés, qui avancent dans le tunnel et finissent par réserver.<br><br>Cela permet au promoteur et à son agence média de réallouer le budget vers les canaux réellement performants, de tester de nouvelles approches et de justifier chaque décision d'investissement avec des données concrètes tirées du comportement dans Immersion.",
                  "Atlas connects qualified visits and reservations back to their acquisition channels: digital campaigns, email, social, SEO, events, and more.<br><br>Instead of just counting traffic, Atlas focuses on lead quality by source: which channels bring visitors who truly engage, move through the funnel, and eventually reserve.<br><br>This lets developers and media agencies reallocate spend to what actually works, test new strategies, and justify marketing decisions using real behavioural data from Immersion."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Marketing ROI</span>
                  <span className="lang-en">Marketing ROI</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Attribution marketing pilotée par l&apos;IA</span>
                  <span className="lang-en">AI-driven marketing attribution</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Atlas relie visites, qualité des leads et conversions aux bons canaux marketing :
                  </span>
                  <span className="lang-en">
                    Atlas ties visits, lead quality and conversions back to the right marketing channels:
                  </span>
                </p>
                <ul className="card-list">
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Google Ads, Facebook, YouTube, campagnes courriel.</span>
                    <span className="lang-en">Google Ads, Facebook, YouTube, email campaigns.</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Origines du trafic web et de vos formulaires.</span>
                    <span className="lang-en">Traffic origin and form submissions by source.</span>
                  </li>
                </ul>
                <div className="card-footer-note">
                  <span className="lang-fr">Enfin une vue précise du rendement réel de chaque dollar investi en acquisition.</span>
                  <span className="lang-en">Finally, a clear view of the real return on every dollar invested in acquisition.</span>
                </div>
              </article>

              {/* Card: Monthly reports */}
              <article
                className="card"
                onClick={() => openModal(
                  'Rapports mensuels automatisés',
                  'Automated monthly reports',
                  "Chaque mois, Atlas compile l'ensemble des données du projet en un rapport PDF clair et exploitable : volumes de visites, profils d'acheteurs, unités vedettes, objections récurrentes et performance des équipes de vente.<br><br>L'objectif n'est pas de noyer le promoteur sous les chiffres, mais de lui livrer une lecture stratégique prête à être discutée en comité : ce qui fonctionne, ce qui bloque, et où se trouvent les opportunités.<br><br>Le rapport devient un outil de pilotage récurrent du projet, au même titre qu'un suivi de chantier ou un tableau de bord financier.",
                  "Every month, Atlas compiles all project data into a clear, actionable PDF report: visit volumes, buyer profiles, star units, recurring objections, and sales team performance.<br><br>The goal is not to flood you with numbers, but to deliver a strategic readout ready for leadership meetings: what works, what doesn't, and where the opportunities lie.<br><br>The report becomes a recurring steering tool for the project, just like a construction update or financial dashboard."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Reporting</span>
                  <span className="lang-en">Reporting</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Rapports mensuels automatisés</span>
                  <span className="lang-en">Automated monthly reports</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Atlas génère un rapport PDF clé en main pour chaque projet :
                  </span>
                  <span className="lang-en">
                    Atlas generates a turnkey PDF report for each project:
                  </span>
                </p>
                <ul className="card-list">
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Trafic, profils d&apos;acheteurs et unités vedettes.</span>
                    <span className="lang-en">Traffic, buyer profiles and top-performing units.</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Objections récurrentes et performance des équipes.</span>
                    <span className="lang-en">Recurring objections and sales team performance.</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">Recommandations stratégiques prêtes à discuter en comité de direction.</span>
                    <span className="lang-en">Strategic recommendations, ready for boardroom discussions.</span>
                  </li>
                </ul>
              </article>
            </aside>
          </div>
        </section>

        {/* AUTOMATION & AI GUIDANCE */}
        <section id="automation" className="section reveal">
          <header className="section-header">
            <div className="section-eyebrow">
              <span className="lang-fr">Bloc 04</span>
              <span className="lang-en">Block 04</span>
            </div>
            <h2 className="section-title">
              <span className="highlight lang-fr">Visites &amp; guidance IA</span>
              <span className="highlight lang-en">Tours &amp; AI guidance</span>
              <span className="lang-fr">— du co-pilote à la visite autonome.</span>
              <span className="lang-en">— from co-pilot mode to fully assisted tours.</span>
            </h2>
            <p className="section-tagline">
              <span className="lang-fr">Atlas ne se contente pas d&apos;observer : il sait aussi guider, suggérer et accompagner.</span>
              <span className="lang-en">Atlas doesn&apos;t just observe: it can guide, suggest and assist along the way.</span>
            </p>
          </header>

          <div className="section-grid">
            <div className="section-main">
              {/* Card: Co-pilot */}
              <article
                className="card"
                onClick={() => openModal(
                  'Mode co-pilote pour les courtiers',
                  'Co-pilot mode for brokers',
                  "Pendant une visite, Atlas écoute ce qui se dit, observe ce qui se passe à l'écran et propose discrètement des actions au courtier : montrer un étage plus élevé, activer la simulation soleil, comparer deux typologies proches, etc.<br><br>Le courtier garde la main sur la visite, mais bénéficie à chaque instant d'un assistant qui lui rappelle les priorités du client et lui suggère la meilleure prochaine étape.<br><br>Cela réduit le risque d'oublier une option pertinente, rassure les profils plus juniors et harmonise la qualité des présentations à travers l'équipe.",
                  "During a visit, Atlas listens to the conversation, tracks what's shown on screen, and quietly suggests next actions to the broker: show a higher floor, switch to sun simulation, compare two close typologies, and more.<br><br>The broker stays in control of the visit, but benefits from an assistant that keeps the buyer's priorities top-of-mind and suggests the best next move.<br><br>This reduces the risk of missing a key option, supports junior team members, and raises the overall consistency of presentations."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Co-pilote</span>
                  <span className="lang-en">Co-pilot</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Mode co-pilote pour les courtiers</span>
                  <span className="lang-en">Co-pilot mode for brokers</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Pendant une visite en présentiel ou à distance, Atlas écoute et propose discrètement des actions au courtier.
                  </span>
                  <span className="lang-en">
                    During on-site or remote visits, Atlas listens and discreetly suggests what the broker should do next.
                  </span>
                </p>
                <ul className="card-list">
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">&quot;Montre-lui les étages supérieurs.&quot;</span>
                    <span className="lang-en">&quot;Show them the higher floors.&quot;</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">&quot;Passe en simulation soleil, la lumière est un enjeu pour eux.&quot;</span>
                    <span className="lang-en">&quot;Switch to sun simulation — light matters to them.&quot;</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">&quot;Avec un budget de 1M, l&apos;unité 1803 est parfaitement alignée.&quot;</span>
                    <span className="lang-en">&quot;With a $1M budget, unit 1803 is perfectly aligned.&quot;</span>
                  </li>
                </ul>
              </article>

              {/* Card: Remote visits */}
              <article
                className="card"
                onClick={() => openModal(
                  'Visites à distance automatisées',
                  'Automated remote visits',
                  "En dehors des heures d'ouverture, Atlas peut prendre le relais : accueillir un visiteur en ligne, comprendre ses besoins de base, lui présenter une sélection d'unités et lui permettre d'explorer le projet de manière structurée.<br><br>À la fin de la session, un résumé complet est envoyé à l'équipe de vente : profil du client, unités visitées, réactions clés, points à valider. Le courtier peut ensuite reprendre le dossier avec un coup de fil ou un courriel ciblé.<br><br>Cela permet d'exploiter le trafic généré en soirée, la fin de semaine ou lors de campagnes numériques intensives, sans épuiser les équipes sur place.",
                  "Outside of opening hours, Atlas can take over: welcome a visitor online, understand their basic needs, present a selection of units, and guide them through a structured exploration of the project.<br><br>At the end of the session, a full summary is sent to the sales team: buyer profile, units visited, key reactions, and points to confirm. The broker can then take over with a targeted call or email.<br><br>This lets you fully leverage traffic in evenings, weekends, or peak campaign periods — without burning out your teams."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Remote</span>
                  <span className="lang-en">Remote</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Visites à distance automatisées</span>
                  <span className="lang-en">Automated remote visits</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    En dehors des heures d&apos;ouverture, Atlas peut accueillir les visiteurs, présenter le projet et envoyer un résumé complet à l&apos;équipe de vente le lendemain.
                  </span>
                  <span className="lang-en">
                    When your showroom is closed, Atlas can still welcome visitors, present the project and deliver a full summary to the sales team the next day.
                  </span>
                </p>
                <div className="card-footer-note">
                  <span className="lang-fr">Votre projet reste &quot;ouvert&quot; 24/7, sans surcharger vos équipes.</span>
                  <span className="lang-en">Your project is effectively &quot;open&quot; 24/7 — without overloading your teams.</span>
                </div>
              </article>
            </div>

            <aside className="section-side">
              {/* Card: Virtual guide */}
              <article
                className="card"
                onClick={() => openModal(
                  'Guide virtuel alimenté par l\'IA (vision)',
                  'AI-powered virtual guide (vision)',
                  "À moyen terme, Atlas pourra piloter Immersion de bout en bout, comme un courtier virtuel : se déplacer dans le projet, changer de vues, filtrer les unités, comparer des options et répondre à des questions complexes sur le produit.<br><br>Ce guide virtuel pourra prendre en charge des volumes élevés de leads en début de cycle, qualifier les clients et les orienter vers les unités les plus adaptées avant même que l'équipe de vente ne prenne le relais.<br><br>Pour les projets d'envergure ou très médiatisés, c'est une façon d'absorber les pics d'intérêt sans perdre de qualité ni saturer les ressources humaines.",
                  "Over time, Atlas will be able to pilot Immersion end-to-end as a virtual broker: moving through the project, changing views, applying filters, comparing options and answering complex questions about the product.<br><br>This virtual guide can handle large volumes of early-stage leads, qualify them, and direct them toward the best-fit units before a human broker steps in.<br><br>For flagship or highly publicized projects, it's a way to absorb intense interest without compromising quality or overextending your team."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Vision</span>
                  <span className="lang-en">Vision</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Guide virtuel alimenté par l&apos;IA (vision)</span>
                  <span className="lang-en">AI-powered virtual guide (vision)</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    À moyen terme, Atlas pourra naviguer Immersion comme un courtier : se déplacer dans le projet, filtrer, zoomer, comparer, et répondre aux questions de l&apos;acheteur en direct.
                  </span>
                  <span className="lang-en">
                    In the medium term, Atlas will be able to navigate Immersion like a broker: move through the project, filter, zoom, compare, and answer questions live.
                  </span>
                </p>
                <div className="card-footer-note">
                  <span className="lang-fr">Un véritable &quot;agent virtuel&quot; Immersion, pour les projets à très fort volume de leads.</span>
                  <span className="lang-en">A true &quot;virtual agent&quot; for Immersion, built for projects with very high lead volume.</span>
                </div>
              </article>
            </aside>
          </div>
        </section>

        {/* VOICE & TEXT ASSISTANT */}
        <section id="assistant" className="section reveal">
          <header className="section-header">
            <div className="section-eyebrow">
              <span className="lang-fr">Bloc 05</span>
              <span className="lang-en">Block 05</span>
            </div>
            <h2 className="section-title">
              <span className="highlight lang-fr">Assistant &quot;Dis Atlas…&quot;</span>
              <span className="highlight lang-en">&quot;Hey Atlas…&quot; assistant</span>
              <span className="lang-fr">— une intelligence toujours à portée de voix.</span>
              <span className="lang-en">— intelligence, always one question away.</span>
            </h2>
            <p className="section-tagline">
              <span className="lang-fr">Qu&apos;il s&apos;agisse d&apos;un courtier, d&apos;un promoteur ou d&apos;un acheteur, Atlas répond instantanément aux questions clés.</span>
              <span className="lang-en">Whether it&apos;s a broker, a developer or a buyer, Atlas answers key questions instantly.</span>
            </p>
          </header>

          <div className="section-grid">
            <div className="section-main">
              {/* Card: Q&A */}
              <article
                className="card"
                onClick={() => openModal(
                  'Questions en temps réel dans Immersion',
                  'Real-time questions inside Immersion',
                  "L'assistant \"Dis Atlas…\" permet aux utilisateurs d'interroger directement la plateforme en langage naturel, sans devoir naviguer dans des menus ou des tableaux complexes.<br><br>Un courtier peut demander de filtrer les unités correspondant à un budget donné, une vue spécifique ou une configuration précise. Un promoteur peut obtenir en quelques secondes les unités les plus consultées cette semaine, ou les typologies qui performent le mieux.<br><br>Cette couche conversationnelle rend Immersion encore plus accessible, même pour des utilisateurs occasionnels ou des intervenants externes à l'équipe de vente.",
                  "The \"Hey Atlas…\" assistant lets users query the platform in natural language, without digging through menus or dashboards.<br><br>A broker can ask to see units under a specific budget, with a given view, or matching precise criteria. A developer can get, in seconds, the week's most popular units or best-performing typologies.<br><br>This conversational layer makes Immersion accessible even to occasional users and external stakeholders."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Q&amp;A</span>
                  <span className="lang-en">Q&amp;A</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Questions en temps réel dans Immersion</span>
                  <span className="lang-en">Real-time questions inside Immersion</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Atlas répond à la voix ou au clavier à des questions comme :
                  </span>
                  <span className="lang-en">
                    Atlas answers voice or text questions like:
                  </span>
                </p>
                <ul className="card-list">
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">&quot;Quelles unités donnent sur le fleuve sous 700&nbsp;000&nbsp;$ ?&quot;</span>
                    <span className="lang-en">&quot;Which units face the river under $700,000?&quot;</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">&quot;Affiche les unités au-dessus du 20<sup>e</sup> étage avec stationnement.&quot;</span>
                    <span className="lang-en">&quot;Show me units above the 20th floor with parking.&quot;</span>
                  </li>
                  <li>
                    <span className="card-bullet"></span>
                    <span className="lang-fr">&quot;Quelles sont les unités les plus populaires cette semaine ?&quot;</span>
                    <span className="lang-en">&quot;What are the most popular units this week?&quot;</span>
                  </li>
                </ul>
              </article>

              {/* Card: Knowledge engine */}
              <article
                className="card"
                onClick={() => openModal(
                  'Moteur de connaissances Atlas',
                  'Atlas knowledge engine',
                  "Au-delà des données de vente, Atlas consolide toutes les informations pertinentes autour du projet : fiches techniques, commodités, environnement urbain, temps de déplacement, informations sur le promoteur, comparatifs avec d'autres projets, etc.<br><br>L'assistant devient ainsi un point d'entrée unique pour répondre aux questions des acheteurs, des courtiers et des partenaires, sans devoir fouiller dans plusieurs documents ou outils.<br><br>C'est une manière de capitaliser sur tout le contenu produit autour du projet et de le rendre enfin accessible, au bon moment, à la bonne personne.",
                  "Beyond sales data, Atlas consolidates all relevant information around the project: technical sheets, amenities, urban context, commuting times, information about the developer, comparisons with other projects, and more.<br><br>The assistant becomes a single entry point to answer questions from buyers, brokers and partners, without searching through multiple tools or PDFs.<br><br>It's a way to leverage all the content created around the project and make it truly accessible at the right time, to the right person."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Connaissance</span>
                  <span className="lang-en">Knowledge</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Moteur de connaissances Atlas</span>
                  <span className="lang-en">Atlas knowledge engine</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Atlas consolide les informations du projet et de son environnement : commodités, transports, temps de déplacement, détails sur le promoteur, comparatifs avec d&apos;autres projets.
                  </span>
                  <span className="lang-en">
                    Atlas consolidates project and context information: amenities, transit, travel times, developer details, and market comparisons.
                  </span>
                </p>
              </article>
            </div>

            <aside className="section-side">
              {/* Card: Objection handling */}
              <article
                className="card"
                onClick={() => openModal(
                  'Gestion des objections assistée',
                  'AI-assisted objection handling',
                  "Lorsqu'un client exprime un doute — balcon jugé trop petit, impression de manque de rangement, perception de prix élevé — Atlas peut suggérer au courtier, en temps réel, des angles de réponse ou des alternatives pertinentes.<br><br>L'outil s'appuie sur ce qui a déjà fonctionné dans d'autres visites, sur les atouts objectifs du projet et sur les unités comparables disponibles dans l'inventaire.<br><br>Au lieu de subir l'objection, le courtier la transforme en opportunité de mieux expliquer la valeur du projet ou de rediriger vers une option mieux alignée, sans perdre le fil de la visite.",
                  "When a buyer raises a concern — balcony feels too small, not enough storage, price seems high — Atlas can suggest, in real time, ways to respond or alternatives to propose.<br><br>It draws on what has worked in past visits, on the objective strengths of the project, and on comparable units available in the inventory.<br><br>Instead of being thrown off by objections, brokers can use them as opportunities to re-frame value or redirect towards a better-fit option, without losing the rhythm of the visit."
                )}
              >
                <div className="card-label">
                  <span className="card-label-dot"></span>
                  <span className="lang-fr">Objections</span>
                  <span className="lang-en">Objections</span>
                </div>
                <h3 className="card-title">
                  <span className="lang-fr">Gestion des objections assistée</span>
                  <span className="lang-en">AI-assisted objection handling</span>
                </h3>
                <p className="card-body">
                  <span className="lang-fr">
                    Quand un acheteur soulève un frein (&quot;balcon trop petit&quot;, &quot;manque de rangement&quot;, &quot;prix élevé&quot;), Atlas peut suggérer en temps réel la meilleure réponse ou alternative.
                  </span>
                  <span className="lang-en">
                    When a buyer expresses a concern (&quot;balcony too small&quot;, &quot;not enough storage&quot;, &quot;too expensive&quot;), Atlas suggests the best response or alternative in real time.
                  </span>
                </p>
              </article>
            </aside>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="summary reveal">
          <div className="summary-inner">
            <h2 className="summary-title">
              <span className="lang-fr">En résumé — Atlas comme cœur intelligent d&apos;Immersion</span>
              <span className="lang-en">In summary — Atlas as the intelligent core of Immersion</span>
            </h2>
            <p className="summary-body">
              <span className="lang-fr">
                Immersion Atlas transforme la plateforme en un écosystème véritablement intelligent : il observe, comprend, suggère et anticipe. C&apos;est une couche d&apos;analyse et de guidance qui relie les besoins réels des acheteurs, la réalité du terrain des courtiers et les enjeux stratégiques des promoteurs.
              </span>
              <span className="lang-en">
                Immersion Atlas turns the platform into a truly intelligent ecosystem: it observes, understands, suggests and anticipates. It&apos;s an analysis and guidance layer that connects real buyer needs, the day-to-day reality of brokers, and the strategic priorities of developers.
              </span>
            </p>
            <p className="summary-tagline">
              <span className="lang-fr">
                Avec Atlas, Immersion ne se contente plus de montrer vos projets — il explique pourquoi ils se vendent, comment les optimiser et où concentrer vos efforts pour maximiser la valeur.
              </span>
              <span className="lang-en">
                With Atlas, Immersion doesn&apos;t just show your projects — it explains why they sell, how to optimize them, and where to focus to maximize value.
              </span>
            </p>
          </div>
        </section>
      </main>

      {/* Modal Popup */}
      <div
        className={`atlas-modal${modal.open ? ' visible' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
      >
        <div className="atlas-modal-content">
          <button className="atlas-modal-close" onClick={closeModal}>✕</button>
          <h2 className="atlas-modal-title">{modalTitle}</h2>
          <p
            className="atlas-modal-text"
            dangerouslySetInnerHTML={{ __html: modalDesc }}
          />
        </div>
      </div>

      {/* Atlas chatbot trigger (Scroll.ai) */}
      <button
        type="button"
        className="scroll-expert-trigger immersion-ai-button"
        data-expert="cn_01kesh50b4fw4se6y5v6dea92z"
        data-token="embed_01khkm511cefdvfwswrrx3fn5t"
        aria-label="Chat with Atlas"
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3L13.5 7.5L18 9L13.5 10.5L12 15L10.5 10.5L6 9L10.5 7.5L12 3Z" fill="white"/>
          <path d="M18.5 14L19.3 16L21.3 16.8L19.3 17.6L18.5 19.6L17.7 17.6L15.7 16.8L17.7 16L18.5 14Z" fill="white" opacity="0.7"/>
          <path d="M6 15.5L6.6 17L8 17.6L6.6 18.2L6 19.6L5.4 18.2L4 17.6L5.4 17L6 15.5Z" fill="white" opacity="0.6"/>
        </svg>
      </button>
    </div>
  )
}
