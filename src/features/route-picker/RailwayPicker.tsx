import type { CSSProperties } from 'react'
import { MaterialIcon } from '../../components/MaterialIcon'
import { routeChoiceCampaignByOperatorId } from '../../config/unlockCampaigns'
import type { RouteAchievementLevel, RouteEffortProgress } from '../../domain/progress'
import type { RailwayOperator, Route } from '../../domain/types'
import { isOperatorUnlocked, isRouteUnlocked, routeChoiceStatus, type UnlockProgress } from '../../domain/unlocks'
import './RailwayPicker.css'

export interface PickerRouteProgress {
  stationIds: string[]
  completed: number
  achievement: RouteAchievementLevel
  effort: RouteEffortProgress
  checkpoints: number
}

interface OperatorProgress {
  completedRoutes: number
  masteredRoutes: number
}

interface RailwayPickerProps {
  operators: readonly RailwayOperator[]
  routes: readonly Route[]
  selectedOperator: RailwayOperator
  selectedRoute: Route
  visibleRoutes: readonly Route[]
  routeProgress: ReadonlyMap<string, PickerRouteProgress>
  operatorProgress: ReadonlyMap<string, OperatorProgress>
  operatorUnlockProgress: ReadonlyMap<string, UnlockProgress>
  unlockedMilestones: readonly string[]
  onChooseOperator: (operatorId: string) => void
  onChooseRoute: (routeId: string) => void
  onUnlockRoute: (routeId: string) => void
}

export function RailwayPicker({
  operators,
  routes,
  selectedOperator,
  selectedRoute,
  visibleRoutes,
  routeProgress,
  operatorProgress,
  operatorUnlockProgress,
  unlockedMilestones,
  onChooseOperator,
  onChooseRoute,
  onUnlockRoute,
}: RailwayPickerProps) {
  const campaign = routeChoiceCampaignByOperatorId.get(selectedOperator.id)
  const campaignStatus = campaign ? routeChoiceStatus(campaign, unlockedMilestones) : undefined
  const lockedRoutes = campaign
    ? routes.filter((route) => route.operatorId === selectedOperator.id && !isRouteUnlocked(route, operators, unlockedMilestones))
    : []

  return (
    <div className="route-picker">
      <div className="route-picker-group">
        <p className="route-picker-label"><span>1</span>てつどうがいしゃ</p>
        <nav className="operator-tabs" aria-label="てつどうがいしゃを えらぶ">
          {operators.map((operator) => {
            const progress = operatorProgress.get(operator.id) ?? { completedRoutes: 0, masteredRoutes: 0 }
            const unlocked = isOperatorUnlocked(operator, unlockedMilestones)
            const accessProgress = operatorUnlockProgress.get(operator.id)
            const operatorCampaign = routeChoiceCampaignByOperatorId.get(operator.id)
            const operatorCampaignStatus = operatorCampaign ? routeChoiceStatus(operatorCampaign, unlockedMilestones) : undefined
            return (
              <button
                key={operator.id}
                type="button"
                className={`${operator.id === selectedOperator.id ? 'operator-tab operator-tab--active' : 'operator-tab'} ${unlocked ? '' : 'operator-tab--locked'}`.trim()}
                style={{ '--operator-color': operator.color } as CSSProperties}
                aria-pressed={operator.id === selectedOperator.id}
                disabled={!unlocked}
                onClick={() => onChooseOperator(operator.id)}
              >
                {unlocked
                  ? <i className="operator-tab-mark" aria-hidden="true"><span /><span /><span /></i>
                  : <span className="operator-tab-lock" aria-hidden="true"><MaterialIcon name="lock" filled /></span>}
                <span className="operator-tab-copy">
                  <strong>{operator.name}</strong>
                  <small>
                    {unlocked
                      ? operatorCampaignStatus
                        ? <>スタンプ {operatorCampaignStatus.earnedStamps}こ{operatorCampaignStatus.availableChoices > 0 && `　🎫${operatorCampaignStatus.availableChoices}まい`}</>
                        : <>{progress.completedRoutes}/{operator.routeIds.length}ろせん クリア{progress.masteredRoutes > 0 && `　★★${progress.masteredRoutes}`}</>
                      : <>{accessProgress?.completed ?? 0}/{accessProgress?.total ?? 0}ろせん　あと{Math.max(0, (accessProgress?.total ?? 0) - (accessProgress?.completed ?? 0))}ろせん</>}
                  </small>
                </span>
              </button>
            )
          })}
        </nav>
      </div>
      <div className="route-picker-group">
        <p className="route-picker-label"><span>2</span>ろせん</p>
        <nav className="route-tabs" aria-label={`${selectedOperator.name}の ろせんを えらぶ`}>
          {visibleRoutes.map((route) => {
            const progress = routeProgress.get(route.id) ?? {
              stationIds: [], completed: 0, achievement: 'none' as const,
              effort: { practicedPositions: 0, totalPositions: 0, ratio: 0 }, checkpoints: 0,
            }
            return (
              <button
                key={route.id}
                type="button"
                className={route.id === selectedRoute.id ? 'route-tab route-tab--active' : 'route-tab'}
                style={{ '--route-color': route.color } as CSSProperties}
                aria-pressed={route.id === selectedRoute.id}
                onClick={() => onChooseRoute(route.id)}
              >
                <span aria-hidden="true" />
                <strong>{route.name}</strong>
                <small>{progress.completed}/{progress.stationIds.length}{progress.checkpoints > 0 && `　●${progress.checkpoints}/4`}</small>
                {progress.achievement !== 'none' && (
                  <i className={`route-tab-achievement route-tab-achievement--${progress.achievement}`} aria-label={progress.achievement === 'master' ? 'ろせんマスター' : 'ろせんクリア'}>
                    {progress.achievement === 'master' ? '★★' : '★'}
                  </i>
                )}
              </button>
            )
          })}
        </nav>
      </div>
      {campaign && campaignStatus && lockedRoutes.length > 0 && (
        <section className={`route-unlock-panel ${campaignStatus.availableChoices > 0 ? 'route-unlock-panel--ready' : ''}`} aria-labelledby="route-unlock-heading">
          <div className="route-unlock-heading">
            <span className="route-ticket" aria-hidden="true"><MaterialIcon name={campaignStatus.availableChoices > 0 ? 'confirmation_number' : 'lock'} filled /></span>
            <div>
              <strong id="route-unlock-heading">{campaignStatus.availableChoices > 0 ? 'すきな ろせんを ひらけるよ！' : 'くかんスタンプを あつめよう'}</strong>
              <small>
                スタンプ {campaignStatus.earnedStamps}こ
                {campaignStatus.availableChoices > 0
                  ? `　きっぷ ${campaignStatus.availableChoices}まい`
                  : campaignStatus.nextStampTarget ? `　あと ${Math.max(0, campaignStatus.nextStampTarget - campaignStatus.earnedStamps)}こ` : ''}
              </small>
            </div>
          </div>
          <div className="locked-campaign-routes">
            {lockedRoutes.map((route) => (
              <button
                key={route.id}
                type="button"
                style={{ '--route-color': route.color } as CSSProperties}
                disabled={campaignStatus.availableChoices < 1}
                onClick={() => onUnlockRoute(route.id)}
              >
                <i aria-hidden="true" />
                <span><strong>{route.name}</strong><small>{route.orderedStationIds.length}えき</small></span>
                <MaterialIcon name={campaignStatus.availableChoices > 0 ? 'lock_open' : 'lock'} filled={campaignStatus.availableChoices > 0} />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
