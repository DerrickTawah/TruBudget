import React from 'react';
import moment from 'moment';
import OpenIcon from 'material-ui/svg-icons/navigation/close';
import InProgressIcon from 'material-ui/svg-icons/navigation/subdirectory-arrow-right';
import DoneIcon from 'material-ui/svg-icons/navigation/check';
import accounting from 'accounting';
import _ from 'lodash';

import currencies from './currency';

import { taskStatusColorPalette, budgetStatusColorPalette, workflowBudgetColorPalette } from './colors';

const getCurrencyFormat = (currency) => ({ decimal: ".", thousand: "", precision: 2, ...currencies[currency] })

export const fromAmountString = (amount, currency) => accounting.unformat(amount, getCurrencyFormat(currency).decimal);
export const toAmountString = (amount, currency) => accounting.formatMoney(amount, getCurrencyFormat(currency));

export const tsToString = (ts) => {
  let dateString = moment(ts, 'x').format("MMM D, YYYY");
  return dateString;
}
export const typeMapping = {
  workflow: 'Workflow',
  transaction: 'Transaction'
}
export const statusMapping = {
  done: 'Done',
  'in_review': 'In review',
  'in_progress': 'In progress',
  open: 'Open'
}

export const amountTypes = {
  na: 'N/A',
  allocated: 'Allocated',
  disbursed: 'Disbursed'
}

export const statusIconMapping = {
  done: <DoneIcon />,
  'in_progress': <InProgressIcon />,
  open: <OpenIcon />,
}

const actionMapping = (assignee, bank, approver) => ({
  'in_review': `Pending for review of ${approver}`,
  pending: `Pending for approval of ${bank}`,
  'in_progress': `Pending on  ${assignee}`,
  open: `Pending on  ${assignee}`,
})



const createDoughnutData = (labels, data, colors = taskStatusColorPalette, ) => ({
  labels,
  datasets: [
    {
      data: data,
      backgroundColor: colors,
      hoverBackgroundColor: colors,
    }
  ]
});

export const calculateUnspentAmount = (items) => {
  const amount = items.reduce((acc, item) => {
    return acc + parseInt(item.details.amount, 10)
  }, 0);
  return amount;
}

export const calculateWorkflowBudget = (workflows) => {
  return workflows.reduce((acc, workflow) => {
    const { amount, amountType } = workflow.data;
    const next = {
      allocated: amountType === 'allocated' ? acc.allocated + amount : acc.allocated,
      disbursed: amountType === 'disbursed' ? acc.disbursed + amount : acc.disbursed
    }

    return next;
  }, { allocated: 0, disbursed: 0 })
}

export const createAmountData = (projectAmount, subProjects) => {
  const subProjectsAmount = calculateUnspentAmount(subProjects)
  const unspent = projectAmount - subProjectsAmount;
  // TODO: Whats is that???
  const spentText = unspent < 0 ? "Not assigned" : "Not assigned"
  return createDoughnutData(["Assigned", spentText], [subProjectsAmount, unspent < 0 ? 0 : unspent], budgetStatusColorPalette);
}

export const createSubprojectAmountData = (subProjectAmount, workflows) => {
  const { allocated, disbursed } = calculateWorkflowBudget(workflows);

  const allocationLeft = allocated - disbursed;
  const budgetLeft = subProjectAmount - allocated;
  return createDoughnutData(["Unallocated Budget", "Allocated Budget", "Spent"], [budgetLeft, allocationLeft, disbursed], workflowBudgetColorPalette)
}

export const getProgressInformation = (items) => {
  let startValue = {
    open: 0,
    inProgress: 0,
    inReview: 0,
    done: 0
  }
  const projectStatus = items.reduce((acc, item) => {
    const status = item.details.status;
    return {
      open: status === 'open' ? acc.open + 1 : acc.open,
      inProgress: status === 'in_progress' ? acc.inProgress + 1 : acc.inProgress,
      inReview: status === 'in_review' ? acc.inReview + 1 : acc.inReview,
      done: status === 'done' ? acc.done + 1 : acc.done,
    };
  }, startValue);
  return projectStatus;
}


export const createTaskData = (items, type) => {
  const projectStatus = getProgressInformation(items)
  if (type === 'workflows') {
    return createDoughnutData(["Open", "In progress", "In Review", "Done"], [projectStatus.open, projectStatus.inProgress, projectStatus.inReview, projectStatus.done]);
  }
  return createDoughnutData(["Open", "In progress", "Done"], [projectStatus.open, projectStatus.inProgress, projectStatus.done]);
}

export const getNextIncompletedItem = (items) => {
  return items.find((item) => item.details.status === 'open' | item.details.status === 'in_progress' | item.details.status === 'in_review');
}

export const getNextAction = (item, assignee, bank, approver) => {
  return !_.isUndefined(item) && !_.isUndefined(item.details.status)
    && !_.isEmpty(item.details.status)
    ? actionMapping(assignee, bank, approver)[item.details.status]
    : "No actions required "
}


export const getAssignedOrganization = (organizations) => organizations.reduce((acc, organization, index) => {
  const nextString = index ? `, ${organization}` : `${organization}`
  return acc + nextString;
}, "")
