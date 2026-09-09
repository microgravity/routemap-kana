import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { MaterialIcon } from '../components/MaterialIcon'
import { basicKanaRows, smallKanaRows, voicedKanaRows } from '../data/kanaChart'
import { railwayOperatorById, railwayOperators, routes } from '../data/stations'
import { formatMilestoneDate } from '../domain/milestoneHistory'
import { buildProfileSnapshot, type ProfileRouteRecord } from '../domain/profile'
import type { MilestoneHistoryEvent } from '../domain/types'
import { isOperatorUnlocked, isRouteUnlocked, metroUnlockStatus, routeCheckpointMilestones, unlockMilestoneById, unlockProgress } from '../domain/unlocks'
import { useAppState } from './AppState'

const profileKana = [...basicKanaRows.flat(), ...voicedKanaRows.flat(), ...smallKanaRows.flat()]
  .filter((kana): kana is string => Boolean(kana))

export function ProfilePage() {
  const { state, stations, stationById, routeStationIds } = useAppState()
  const routeInputs = useMemo(() => routes.map((route) => ({
    route,
    stationIds: routeStationIds(route.id),
    unlocked: isRouteUnlocked(route, railwayOperators, state.unlockedMilestones),
  })), [routeStationIds, state.unlockedMilestones])
  const profile = useMemo(() => buildProfileSnapshot(
    stations,
    routeInputs,
    state.progress,
    state.unlockedMilestones,
    routeCheckpointMilestones,
  ), [routeInputs, state.progress, state.unlockedMilestones, stations])
  const routeRecordById = useMemo(
    () => new Map(profile.routes.map((route) => [route.routeId, route])),
    [profile.routes],
  )
  const learnedKanaCount = profileKana.filter((kana) => profile.practicedKana.has(kana)).length
  const medals = profile.routes.filter((route) => route.unlocked && route.achievement !== 'none')
  const metroStatus = metroUnlockStatus(state.unlockedMilestones)
  const history = useMemo(
    () => [...state.milestoneHistory].reverse().sort((left, right) => Date.parse(right.achievedAt) - Date.parse(left.achievedAt)),
    [state.milestoneHistory],
  )

  return (
    <div className={`page-shell profile-page ${state.settings.reduceMotion ? 'reduce-motion' : ''}`}>
      <AppHeader compact />
      <main className="profile-main">
        <Link className="back-link" to="/"><MaterialIcon name="arrow_back" />ろせんず</Link>

        <header className="profile-hero">
          <div className="profile-hero-icon" aria-hidden="true"><MaterialIcon name="account_circle" filled /></div>
          <div className="profile-hero-copy">
            <p className="eyebrow">がんばった きろく</p>
            <h1>わたしの きろく</h1>
            <p>かいた もじと、あつめた スタンプを みてみよう。</p>
          </div>
          <div className="profile-hero-badges" aria-label="ろせんの きろく">
            <span><i className="profile-hero-badge-icon" aria-hidden="true"><MaterialIcon name="workspace_premium" filled /></i><strong>{profile.completedRoutes}</strong>ろせん クリア</span>
            <span><i className="profile-hero-badge-icon" aria-hidden="true"><MaterialIcon name="stars" filled /></i><strong>{profile.masteredRoutes}</strong>ろせん マスター</span>
          </div>
        </header>

        <section className="profile-summary" aria-label="ぜんぶの きろく">
          <SummaryCard icon="star" value={profile.completedStations} label="かけた えき" note={`${profile.startedStations - profile.completedStations}えき れんしゅうちゅう`} tone="yellow" />
          <SummaryCard icon="draw" value={profile.practicedPositions} label="かいた もじ" note={`おてほんなし ${profile.masteredStations}えき`} tone="aqua" />
          <SummaryCard icon="spellcheck" value={learnedKanaCount} label="れんしゅうした ひらがな" note={`${profileKana.length}もじの ひょう`} tone="orange" />
          <SummaryCard icon="approval" value={profile.earnedStamps} label="くかんスタンプ" note={metroStatus.availableChoices > 0 ? `ろせんきっぷ ${metroStatus.availableChoices}まい` : '25%ごとに もらえるよ'} tone="purple" />
        </section>

        <section className="profile-section next-goals" aria-labelledby="next-goals-title">
          <div className="profile-section-heading">
            <span className="profile-section-icon"><MaterialIcon name="flag" filled /></span>
            <div><p className="eyebrow">もうすこし！</p><h2 id="next-goals-title">つぎの もくひょう</h2></div>
          </div>
          {profile.nextGoals.length > 0 ? (
            <div className="next-goal-grid">
              {profile.nextGoals.slice(0, 3).map((goal) => (
                <Link key={`${goal.routeId}-${goal.kind}`} className="next-goal-card" to={`/?route=${goal.routeId}`} style={{ '--route-color': goal.routeColor } as React.CSSProperties}>
                  <span className="next-goal-route"><i aria-hidden="true" />{goal.routeName}</span>
                  <strong>{goal.label}</strong>
                  <span className="next-goal-remaining">あと {goal.remaining}もじ</span>
                  <progress value={goal.current} max={Math.max(1, goal.target)} aria-label={`${goal.label}まで あと${goal.remaining}もじ`} />
                  <span className="next-goal-arrow"><MaterialIcon name="arrow_forward" /></span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="profile-empty"><MaterialIcon name="celebration" filled /><strong>いま できる もくひょうを ぜんぶ クリア！</strong></div>
          )}
        </section>

        <section className="profile-section" aria-labelledby="stamps-title">
          <div className="profile-section-heading">
            <span className="profile-section-icon profile-section-icon--stamp"><MaterialIcon name="approval" filled /></span>
            <div><p className="eyebrow">25%ずつ あつめよう</p><h2 id="stamps-title">スタンプちょう</h2></div>
          </div>
          <div className="profile-operator-list">
            {railwayOperators.map((operator) => {
              const operatorUnlocked = isOperatorUnlocked(operator, state.unlockedMilestones)
              const milestone = operator.unlockMilestoneId ? unlockMilestoneById.get(operator.unlockMilestoneId) : undefined
              const access = milestone ? unlockProgress(milestone, { routes, stationById, progress: state.progress }) : undefined
              return (
                <section key={operator.id} className={`profile-operator ${operatorUnlocked ? '' : 'profile-operator--locked'}`} style={{ '--operator-color': operator.color } as React.CSSProperties} aria-labelledby={`profile-operator-${operator.id}`}>
                  <header>
                    <span className="profile-operator-mark" aria-hidden="true"><i /><i /><i /></span>
                    <div><h3 id={`profile-operator-${operator.id}`}>{operator.shortName}</h3><p>{operatorUnlocked ? `${operator.routeIds.length}ろせん` : `あと ${Math.max(0, (access?.total ?? 0) - (access?.completed ?? 0))}ろせんで ひらくよ`}</p></div>
                    {!operatorUnlocked && <MaterialIcon name="lock" filled />}
                  </header>
                  {operatorUnlocked ? (
                    <div className="profile-route-list">
                      {operator.routeIds.map((routeId) => {
                        const record = routeRecordById.get(routeId)
                        return record ? <ProfileRouteCard key={routeId} route={record} /> : null
                      })}
                    </div>
                  ) : (
                    <progress value={access?.completed ?? 0} max={Math.max(1, access?.total ?? 1)} aria-label={`${operator.shortName}まで ${access?.completed ?? 0}/${access?.total ?? 0}ろせん`} />
                  )}
                </section>
              )
            })}
          </div>
        </section>

        <section className="profile-section" aria-labelledby="medals-title">
          <div className="profile-section-heading">
            <span className="profile-section-icon profile-section-icon--medal"><MaterialIcon name="workspace_premium" filled /></span>
            <div><p className="eyebrow">ぜんえき クリアの あかし</p><h2 id="medals-title">ろせんメダル</h2></div>
          </div>
          {medals.length > 0 ? (
            <div className="profile-medals">
              {medals.map((route) => (
                <Link key={route.routeId} to={`/?route=${route.routeId}`} className={`profile-medal profile-medal--${route.achievement}`} style={{ '--route-color': route.color } as React.CSSProperties}>
                  <span className="profile-medal-face" aria-hidden="true"><MaterialIcon name="workspace_premium" filled /></span>
                  <strong>{route.name}</strong>
                  <small>{route.achievement === 'master' ? 'ろせんマスター' : 'ぜんえき クリア'}</small>
                </Link>
              ))}
            </div>
          ) : (
            <div className="profile-empty"><MaterialIcon name="train" /><strong>ろせんを ぜんぶ かくと、メダルが もらえるよ！</strong></div>
          )}
        </section>

        <section className="profile-section" aria-labelledby="learned-kana-title">
          <div className="profile-section-heading profile-section-heading--with-link">
            <span className="profile-section-icon profile-section-icon--kana">あ</span>
            <div><p className="eyebrow">みどりは れんしゅうずみ</p><h2 id="learned-kana-title">ひらがなの きろく</h2></div>
            <Link to="/kana" className="profile-heading-link">ごじゅうおんを みる<MaterialIcon name="arrow_forward" /></Link>
          </div>
          <div className="profile-kana-grid" aria-label={`${learnedKanaCount}もじ れんしゅうした`}>
            {profileKana.map((kana) => profile.practicedKana.has(kana) ? (
              <Link key={kana} to={`/kana/${encodeURIComponent(kana)}`} className="profile-kana profile-kana--learned" aria-label={`${kana}、れんしゅうした`}>
                {kana}<MaterialIcon name="check" filled />
              </Link>
            ) : <span key={kana} className="profile-kana" aria-label={`${kana}、まだ`}>{kana}</span>)}
          </div>
        </section>

        <section className="profile-section profile-history-section" aria-labelledby="history-title">
          <div className="profile-section-heading">
            <span className="profile-section-icon profile-section-icon--history"><MaterialIcon name="history" filled /></span>
            <div><p className="eyebrow">スタンプラリーの おもいで</p><h2 id="history-title">できた！の きろく</h2></div>
          </div>
          {history.length > 0 ? (
            <ol className="profile-history-list">
              {history.map((event) => {
                const route = routes.find((candidate) => candidate.id === event.routeId)
                const operator = route ? railwayOperatorById.get(route.operatorId) : undefined
                return (
                  <li key={event.id} className={`profile-history-item profile-history-item--${event.kind}`} style={{ '--route-color': route?.color ?? '#8f8170' } as React.CSSProperties}>
                    <span className="profile-history-stamp" aria-hidden="true"><MaterialIcon name={historyIcon(event)} filled /></span>
                    <div>
                      <time dateTime={event.achievedAt}>{formatMilestoneDate(event.achievedAt)}</time>
                      <strong>{operator?.shortName ? `${operator.shortName}　` : ''}{route?.name ?? 'ろせん'}　{historyLabel(event)}</strong>
                      {event.recovered && <small>これまでの きろくから ふっかつ</small>}
                    </div>
                    {route && <Link to={`/?route=${route.id}`} aria-label={`${route.name}の ろせんずを みる`}><MaterialIcon name="arrow_forward" /></Link>}
                  </li>
                )
              })}
            </ol>
          ) : (
            <div className="profile-empty"><MaterialIcon name="approval" /><strong>スタンプや メダルを もらうと、ここに のこるよ！</strong></div>
          )}
        </section>
      </main>
    </div>
  )
}

function historyIcon(event: MilestoneHistoryEvent): string {
  if (event.kind === 'route-stamp') return 'approval'
  if (event.kind === 'route-master') return 'stars'
  return 'workspace_premium'
}

function historyLabel(event: MilestoneHistoryEvent): string {
  if (event.kind === 'route-stamp') return `${Math.round((event.ratio ?? 0) * 100)}% くかんスタンプ！`
  if (event.kind === 'route-master') return 'ろせんマスター！'
  return 'クリア！'
}

function SummaryCard({ icon, value, label, note, tone }: { icon: string; value: number; label: string; note: string; tone: string }) {
  return (
    <article className={`profile-summary-card profile-summary-card--${tone}`}>
      <span className="profile-summary-icon"><MaterialIcon name={icon} filled /></span>
      <div><strong>{value}</strong><span>{label}</span><small>{note}</small></div>
    </article>
  )
}

function ProfileRouteCard({ route }: { route: ProfileRouteRecord }) {
  const content = (
    <>
      <div className="profile-route-heading">
        <span><i aria-hidden="true" />{route.name}</span>
        {route.unlocked
          ? route.achievement === 'master'
            ? <strong className="profile-route-achievement profile-route-achievement--master">★★ マスター</strong>
            : route.achievement === 'complete'
              ? <strong className="profile-route-achievement">★ クリア</strong>
              : <small>{route.completedStations}/{route.totalStations}えき</small>
          : <strong className="profile-route-lock"><MaterialIcon name="lock" filled />まだ</strong>}
      </div>
      <progress value={route.practicedPositions} max={Math.max(1, route.totalPositions)} aria-label={`${route.name} ${Math.round(route.ratio * 100)}パーセント`} />
      <div className="profile-stamps" aria-label={`${route.name}の くかんスタンプ`}>
        {route.checkpoints.map((checkpoint) => (
          <span key={checkpoint.ratio} className={checkpoint.earned ? 'profile-stamp profile-stamp--earned' : 'profile-stamp'}>
            <MaterialIcon name={checkpoint.earned ? 'approval' : 'radio_button_unchecked'} filled={checkpoint.earned} />
            <small>{Math.round(checkpoint.ratio * 100)}%</small>
          </span>
        ))}
      </div>
    </>
  )
  return route.unlocked
    ? <Link to={`/?route=${route.routeId}`} className="profile-route-card" style={{ '--route-color': route.color } as React.CSSProperties}>{content}</Link>
    : <article className="profile-route-card profile-route-card--locked" style={{ '--route-color': route.color } as React.CSSProperties}>{content}</article>
}
