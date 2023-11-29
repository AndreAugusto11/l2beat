import { Layer2 } from '@l2beat/config'
import {
  ManuallyVerifiedContracts,
  VerificationStatus,
} from '@l2beat/shared-pure'
import isEmpty from 'lodash/isEmpty'

import { ChartProps } from '../../../../components'
import { ChartSectionProps } from '../../../../components/project/ChartSection'
import { ContractsSectionProps } from '../../../../components/project/ContractsSection'
import { DescriptionSectionProps } from '../../../../components/project/DescriptionSection'
import { KnowledgeNuggetsProps } from '../../../../components/project/KnowledgeNuggetsSection'
import { MilestonesSectionProps } from '../../../../components/project/MilestonesSection'
import { PermissionsSectionProps } from '../../../../components/project/PermissionsSection'
import { RiskAnalysisProps } from '../../../../components/project/RiskAnalysis'
import { StageSectionProps } from '../../../../components/project/StageSection'
import { StateDerivationSectionProps } from '../../../../components/project/StateDerivationSection'
import { TechnologyIncompleteProps } from '../../../../components/project/TechnologyIncomplete'
import { TechnologySectionProps } from '../../../../components/project/TechnologySection'
import { getContractSection } from '../../../../utils/project/getContractSection'
import { getPermissionsSection } from '../../../../utils/project/getPermissionsSection'
import { getRiskValues } from '../../../../utils/risks/values'
import { getDescriptionSection } from './getDescriptionSection'
import { getTechnologyOverview } from './getTechnologyOverview'

export function getProjectDetails(
  project: Layer2,
  verificationStatus: VerificationStatus,
  manuallyVerifiedContracts: ManuallyVerifiedContracts,
  chart: ChartProps,
) {
  const isUpcoming = project.isUpcoming
  const { incomplete, sections: technologySections } =
    getTechnologyOverview(project)
  const permissionsSection = getPermissionsSection(
    project,
    verificationStatus,
    manuallyVerifiedContracts,
  )
  const items: ScalingDetailsItem[] = []

  items.push({
    type: 'ChartSection',
    props: { ...chart, id: 'chart', title: 'Chart' },
  })

  if (!isUpcoming && project.milestones && !isEmpty(project.milestones)) {
    items.push({
      type: 'MilestonesSection',
      props: {
        milestones: project.milestones,
        id: 'milestones',
        title: 'Milestones',
      },
    })
  }

  items.push({
    type: 'DescriptionSection',
    props: getDescriptionSection(project, verificationStatus),
  })

  if (!isUpcoming) {
    items.push({
      type: 'RiskAnalysisSection',
      props: {
        riskValues: getRiskValues(project.riskView),
        isUnderReview: project.isUnderReview,
        id: 'risk-analysis',
        title: 'Risk analysis',
      },
    })

    if (project.stage.stage !== 'NotApplicable') {
      items.push({
        type: 'StageSection',
        props: {
          stage: project.stage,
          name: project.display.name,
          icon: `/icons/${project.display.slug}.png`,
          type: project.display.category,
          id: 'stage',
          title: 'Rollup stage',
          isUnderReview: project.isUnderReview,
        },
      })
    }

    if (incomplete) {
      items.push({
        type: 'TechnologyIncompleteNote',
        excludeFromNavigation: true,
        props: incomplete,
      })
    }

    /* We want state derivation to be after technology section
       so we split the technology sections into two arrays
       and add state derivation in between */
    const technologySection = technologySections[0]
    items.push({
      type: 'TechnologySection',
      props: {
        items: technologySection.items,
        id: technologySection.id,
        title: technologySection.title,
        isUnderReview: technologySection.isUnderReview,
      },
    })

    if (project.stateDerivation) {
      items.push({
        type: 'StateDerivationSection',
        props: {
          id: 'state-derivation',
          title: 'State derivation',
          ...project.stateDerivation,
        },
      })
    }

    technologySections.slice(1).forEach((section) =>
      items.push({
        type: 'TechnologySection',
        props: {
          items: section.items,
          id: section.id,
          title: section.title,
          isUnderReview: section.isUnderReview,
        },
      }),
    )

    if (permissionsSection) {
      items.push({
        type: 'PermissionsSection',
        props: {
          ...permissionsSection,
          id: 'permissions',
          title: 'Permissions',
        },
      })
    }

    items.push({
      type: 'ContractsSection',
      props: getContractSection(
        project,
        verificationStatus,
        manuallyVerifiedContracts,
      ),
    })

    if (project.knowledgeNuggets && !isEmpty(project.knowledgeNuggets)) {
      items.push({
        type: 'KnowledgeNuggetsSection',
        props: {
          knowledgeNuggets: project.knowledgeNuggets,
          id: 'knowledge-nuggets',
          title: 'Knowledge nuggets',
        },
      })
    }
  } else {
    items.push({
      type: 'UpcomingDisclaimer',
      excludeFromNavigation: true,
    })
  }

  return { incomplete, isUpcoming, items }
}

export type ScalingDetailsItem = { excludeFromNavigation?: boolean } & (
  | ScalingDetailsSection
  | NonSectionElement
)

export type ScalingDetailsSection =
  | ChartSection
  | DescriptionSection
  | MilestonesSection
  | KnowledgeNuggetsSection
  | RiskAnalysisSection
  | TechnologySection
  | StateDerivationSection
  | PermissionsSection
  | ContractsSection
  | StageSection

type NonSectionElement = TechnologyIncompleteNote | UpcomingDisclaimer

interface ChartSection {
  type: 'ChartSection'
  props: ChartSectionProps
}
interface DescriptionSection {
  type: 'DescriptionSection'
  props: DescriptionSectionProps
}

interface MilestonesSection {
  type: 'MilestonesSection'
  props: MilestonesSectionProps
}

interface KnowledgeNuggetsSection {
  type: 'KnowledgeNuggetsSection'
  props: KnowledgeNuggetsProps
}

interface RiskAnalysisSection {
  type: 'RiskAnalysisSection'
  props: RiskAnalysisProps
}

interface StageSection {
  type: 'StageSection'
  props: StageSectionProps
}

interface TechnologyIncompleteNote {
  type: 'TechnologyIncompleteNote'
  props: TechnologyIncompleteProps
}
interface TechnologySection {
  type: 'TechnologySection'
  props: TechnologySectionProps
}

interface StateDerivationSection {
  type: 'StateDerivationSection'
  props: StateDerivationSectionProps
}

interface PermissionsSection {
  type: 'PermissionsSection'
  props: PermissionsSectionProps
}

interface ContractsSection {
  type: 'ContractsSection'
  props: ContractsSectionProps
}

interface UpcomingDisclaimer {
  type: 'UpcomingDisclaimer'
}
