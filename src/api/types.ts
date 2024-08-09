/*
 * Copyright 2024 Cortex Applications, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

interface ScorecardCreator {
  name: string;
  email: string;
}

interface ScorecardExemptions {
  autoApprove: boolean;
  enabled: boolean;
}

interface ScorecardNotifications {
  enabled: boolean;
}

export interface Scorecard {
  creator: ScorecardCreator;
  description?: string;
  exemptions: ScorecardExemptions;
  filter?: EntityFilter | CompoundFilter | null;
  id: number;
  isDraft: boolean;
  name: string;
  nextUpdated?: string;
  notifications: ScorecardNotifications;
  rules: Rule[];
  tag: string;
}

export interface RuleName {
  expression: string;
  title?: string;
}

export interface Rule extends RuleName {
  cqlVersion: string;
  expression: string;
  id: number;
  description?: string;
  failureMessage?: string;
  dateCreated?: string;
  weight: number;
  filter?: EntityFilter | CompoundFilter | null;
}

export interface RuleFilter {
  query?: string;
}

export function ruleName(rule: RuleName): string {
  return rule.title ?? rule.expression;
}

export enum ExemptionStatusResponseType {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface PendingExemptionStatus {
  type: ExemptionStatusResponseType.PENDING;
}

export interface ApprovedExemptionStatus {
  type: ExemptionStatusResponseType.APPROVED;
  approvedBy: string;
  approvedDate: string;
}

export interface RejectedExemptionStatus {
  type: ExemptionStatusResponseType.REJECTED;
  rejectedBy: string;
  rejectedDate: string;
  reason: string;
}

export type ExemptionStatus =
  | PendingExemptionStatus
  | ApprovedExemptionStatus
  | RejectedExemptionStatus;

export interface RuleExemptionResponse {
  id: number;
  entityId: number;
  entityName: string;
  ruleId: number;
  requestingReason: string;
  requestedBy: string;
  requestedDate: string;
  endDate: string | null;
  status: ExemptionStatus;
}

export interface ScorecardRuleExemptionResult {
  scorecardRuleExemptions: Record<number, RuleExemptionResponse[]>;
}

export interface ServiceGroup {
  id: string;
  tag: string;
}

export interface ScorecardLevelRule {
  id: string;
  levelId: string;
  expression: string;
  title?: string;
  description?: string;
  filter?: EntityFilter | CompoundFilter | null;
  cqlVersion: string;
}

export interface ScorecardLevel {
  id: string;
  name: string;
  description?: string;
  color: string;
  rank: number;
  rules: ScorecardLevelRule[];
}

export interface ScorecardLadder {
  scorecardId: string;
  levels: ScorecardLevel[];
}

export interface ScorecardScoreLadderDetails {
  id: string;
  name: string;
}

export interface ScorecardScoreLadderLevel {
  id: number;
  name: string;
  color: string;
  rank: number;
}

export interface ScorecardScoreNextSteps {
  currentLevel?: ScorecardScoreLadderLevel;
  nextLevel?: ScorecardScoreLadderLevel;
  rulesToComplete: ScorecardLevelRule[];
}

export interface ServiceLadderLevels {
  serviceId: number;
  ladderDetails: {
    id: number;
    name: string;
  };
  currentLevel?: {
    name: string;
    color: string;
    rank: number;
  };
}

export interface ServiceScorecardScore {
  score: {
    scorePercentage: number;
    score: number;
    totalPossibleScore: number;
  };
  scorecard: {
    id: number;
    name: string;
    description?: string;
  };
  evaluation: {
    rules: RuleOutcome[];
    ladderLevels: ServiceLadderLevels[];
  };
}

export interface ScorecardScoreEntityOwner {
  id?: number;
  email: string;
  description?: string;
  inheritance: OwnerInheritance;
}

export interface ScorecardServiceScore {
  cid: string;
  serviceId: number;
  componentRef: string;
  description?: string;
  entityOwners: ScorecardScoreEntityOwner[];
  score: number;
  scorePercentage: number;
  totalPossibleScore: number;
  rules: RuleOutcome[];
  lastUpdated: string;
  tags: string[]; // service groups
  teams: string[]; // owner groups
  ladderLevels: ScorecardScoreNextSteps[];
}

export type RuleOutcome =
  | NotEvaluatedRuleOutcome
  | ApplicableRuleOutcome
  | NotApplicableRuleOutcome;

export enum RuleOutcomeType {
  APPLICABLE = 'APPLICABLE',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  NOT_EVALUATED = 'NOT_EVALUATED',
}

export interface RuleOutcomeBase {
  rule: Rule;
  type: RuleOutcomeType;
}

export interface NotEvaluatedRuleOutcome {
  rule: Rule;
  type: RuleOutcomeType.NOT_EVALUATED;
}

export interface ApplicableRuleOutcome extends RuleOutcomeBase {
  score: number;
  leftResult?: number | string;
  error?: string;
  type: RuleOutcomeType.APPLICABLE;
}

export interface NotApplicableRuleOutcome extends RuleOutcomeBase {
  endDate?: string;
  requestedDate?: string;
  approvedDate?: string;
  type: RuleOutcomeType.NOT_APPLICABLE;
}

export interface ScorecardResult {
  scorecardId: number;
  componentRef: string;
  totalScore: number;
  possibleScore: number;
  ruleResults: RuleResult[];
  dateCreated: string;
}

export interface RuleResult {
  id: number;
  expression: string;
  result: boolean;
  score: number;
  weight: number;
  error?: string;
  leftExpression?: string;
  leftResult?: any;
  rightExpression?: string;
  rightResult?: any;
  operation: string;
}

export interface ScoresByIdentifier {
  identifier?: string;
  scores: ScorecardScore[];
  numberOfServices: number;
}

export enum GroupByOption {
  ENTITY = 'Entity',
  TEAM = 'Team',
  SERVICE_GROUP = 'Service Group',
  LEVEL = 'Level',
  DOMAIN = 'Domain',
}

export enum HeaderType {
  RULES = 'Rules',
  LEVELS = 'Levels',
}

export interface ScorecardScore {
  scorecardId: number;
  scorecardName?: string;
  scorePercentage: number;
  dateCreated?: string;
}

export interface InitiativeLadderLevel {
  levelColor: string;
  levelId: string;
  levelName: string;
}

export interface EntityIcon {
  kind: string;
  tag: string;
  url: string;
}

export enum OwnerInheritance {
  Append = 'APPEND',
  Fallback = 'FALLBACK',
  None = 'NONE',
}

export interface EntityOwner {
  description?: string;
  email: string;
  id: string;
  inheritance?: OwnerInheritance;
}

export interface EntityGroups {
  all: string[];
  defined: string[];
}

export interface EntityMetadata {
  description?: string;
  entityGroups: EntityGroups;
  entityOwners: EntityOwner[];
  icon?: EntityIcon;
  id: string;
  name: string;
  ownerGroups: string[];
  tag: string;
}

export interface CatalogEntityMetadata extends EntityMetadata {
  type: string;
}

export enum InitiativeScheduleTimeUnit {
  Day = 'DAY',
  Month = 'MONTH',
  Week = 'WEEK',
}

export interface InitiativeNotificationSchedule {
  timeUnit: InitiativeScheduleTimeUnit;
  timeInterval: number;
  replyToEmails: string[];
  isDisabled: boolean;
}

export interface Initiative {
  description?: string;
  filter?: EntityFilter | CompoundFilter | null;
  id: string;
  levels: InitiativeLadderLevel[];
  name: string;
  rules: InitiativeRule[];
  scorecard: Scorecard;
  targetDate: string;
  notificationSchedule?: InitiativeNotificationSchedule;
}

export interface InitiativeWithScores extends Initiative {
  scores: InitiativeServiceScores[];
}

export interface InitiativeRule {
  ruleId: number;
  expression: string;
  title: string;
  description?: string;
  filter?: RuleFilter;
}

export interface InitiativeLevel {
  ladderId: number;
  levelId: number;
  levelName: string;
  levelColor: string;
}

export interface InitiativeServiceScores {
  scorePercentage: number;
  entityTag: string;
}

export interface InitiativeActionItem {
  rule: Rule;
  componentRef: string;
  initiative: {
    initiativeId: number;
    name: string;
    targetDate: string;
    targetScore?: number;
    description?: string;
  };
}

export interface EntitySyncProgress {
  percentage: number | null;
}

export interface LastEntitySyncTime {
  lastSynced: string | null;
}

export enum OncallProvider {
  PagerDuty = 'PAGERDUTY',
  Opsgenie = 'OPSGENIE',
  Victorops = 'VICTOROPS',
}

export interface Oncall {
  endDate: string | null;
  lastUpdated: string;
  level: number;
  name: string;
  source: OncallProvider;
  startDate: string | null;
  url: string;
}

export interface OncallsResponse {
  oncalls: Oncall[];
}

export interface UserPermissionsResponse {
  permissions: string[];
}

export enum Permission {
  EDIT_SETTINGS = 'EDIT_SETTINGS',
}

export interface JobsResponse {
  jobs: Job[];
}

export interface Job {
  status: JobStatus;
  dateCreated: string;
}

export enum JobStatus {
  InProgress = 'IN_PROGRESS',
  Done = 'DONE',
  Cancelled = 'CANCELLED',
  Failure = 'FAILURE',
  TimedOut = 'TIMED_OUT',
}

export enum ContractType {
  Production = 'PRODUCTION',
  Trial = 'TRIAL',
}

export interface ExpirationResponse {
  contractType: ContractType;
  expirationDate: string | null;
  shutdownDate: string | null;
}

export interface DomainHierarchyNode {
  node: {
    id: number;
    cid: string;
    tag: string;
    name: string;
    type: string;
    description: string | null;
    isArchived: boolean;
    definition: string | null;
  };
  orderedChildren: DomainHierarchyNode[];
}

export interface DomainHierarchiesResponse {
  orderedTree: DomainHierarchyNode[];
}

export interface TeamHierarchyNode {
  node: {
    id: number;
    cid: string;
    tag: string;
    name: string;
    description: string | null;
    isArchived: boolean;
    parentRelationshipProviders: string[];
    ownerGroup: string;
    ownerGroupType: string;
    type: string;
  };
  orderedChildren: TeamHierarchyNode[];
}

export interface TeamHierarchiesResponse {
  orderedParents: TeamHierarchyNode[];
}

export interface ServiceGroupsResponse {
  serviceGroups: string[];
}

// Entity Filter
export enum CategoryFilter {
  Domain = 'Domain',
  Resource = 'Resource',
  Service = 'Service',
  Team = 'Team',
}

export enum FilterType {
  COMPOUND_FILTER = 'COMPOUND_FILTER',
  CQL_FILTER = 'CQL_FILTER',
  DOMAIN_FILTER = 'DOMAIN_FILTER',
  RESOURCE_FILTER = 'RESOURCE_FILTER',
  SERVICE_FILTER = 'SERVICE_FILTER',
  TEAM_FILTER = 'TEAM_FILTER',
}

export interface EntityGroupFilter {
  entityGroups: string[];
  excludedEntityGroups: string[];
}

export interface ResourcesTypeFilter {
  include: boolean;
  types: string[];
}

// NOTE: The interface is the same, only changing name to avoid confusion
export interface CatalogPageTypeFilter extends ResourcesTypeFilter {}

export interface CqlFilter {
  category: CategoryFilter;
  cqlVersion: string;
  query: string;
  type: FilterType.CQL_FILTER;
}

export interface ServiceFilter {
  entityGroupFilter?: EntityGroupFilter;
  type: FilterType.SERVICE_FILTER;
}

export interface DomainFilter {
  entityGroupFilter?: EntityGroupFilter;
  type: FilterType.DOMAIN_FILTER;
}

export interface ResourceFilter {
  entityGroupFilter?: EntityGroupFilter;
  type: FilterType.RESOURCE_FILTER;
  typeFilter?: ResourcesTypeFilter;
}

export interface TeamFilter {
  entityGroupFilter?: EntityGroupFilter;
  type: FilterType.TEAM_FILTER;
}

// TODO(catalog-customization): merge GenericCqlFilter and CqlFilter, when we can fully support the "Generic" category app wide.
interface GenericCqlFilter {
  category: 'Generic';
  cqlVersion: CqlFilter['cqlVersion'];
  query: CqlFilter['query'];
  type: CqlFilter['type'];
}

export interface CompoundFilter {
  cqlFilter?: GenericCqlFilter;
  entityGroupFilter?: EntityGroupFilter;
  type: FilterType.COMPOUND_FILTER;
  typeFilter?: CatalogPageTypeFilter;
}

export type EntityFilter =
  | CqlFilter
  | DomainFilter
  | ServiceFilter
  | ResourceFilter
  | TeamFilter;
