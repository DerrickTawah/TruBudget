import React from "react";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";

import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import strings from "../../localizeStrings";
import { canApproveNode } from "../../permissions";
import * as EmptyStates from "../Common/EmptyStates";

const styles = theme => ({
  container: {
    marginTop: 40,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  nodeCard: {
    width: "40%",
    paddingBottom: "20px"
  },
  card: {
    width: "48%",
    paddingBottom: "20px"
  },
  cardDiv: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  cardHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },

  cardContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "space-around"
  },
  listItem: {
    display: "flex",
    flexDirection: "column"
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  button: {
    margin: theme.spacing.unit
  }
});

const splitNodes = nodes => {
  return nodes.reduce(
    ([self, newOrgaNodes, existingOrgaNodes], node) => {
      const isOwnNode = node.currentAccess.accessType !== "none";

      if (isOwnNode) {
        return [[...self, node], newOrgaNodes, existingOrgaNodes];
      } else {
        const organizationExists = nodes.find(
          existingNode =>
            existingNode.address.organization === node.address.organization &&
            existingNode.address.address !== node.address.address
        );

        if (organizationExists) {
          return [self, [...newOrgaNodes, node], existingOrgaNodes];
        } else {
          return [self, newOrgaNodes, [...existingOrgaNodes, node]];
        }
      }
    },
    [[], [], []]
  );
};

const getListEntries = (nodes, canApprove, classes, cb) => {
  return nodes.map(node => {
    return (
      <div key={node.address.address}>
        <ListItem key={node.address.address}>
          <ListItemText
            primary={
              <div className={classes.listItem}>
                <Typography variant="subtitle1"> {node.address.organization}</Typography>
              </div>
            }
            secondary={`${strings.nodesDashboard.address}: ${node.address.address}`}
          />
          <Button
            variant="contained"
            disabled={node.myVote !== "none" || !canApprove}
            color="primary"
            className={classes.button}
            onClick={() => cb(node.address)}
          >
            {strings.nodesDashboard.approve}
          </Button>
        </ListItem>
        <Divider />
      </div>
    );
  });
};

const NodeVoting = ({ nodes, approveNewNodeForExistingOrganization, allowedIntents, classes }) => {
  const canApprove = canApproveNode(allowedIntents);

  const [_self, newOrgaNodes, existingOrgaNodes] = splitNodes(nodes);

  const newOrgaNodesListEntries = getListEntries(newOrgaNodes, canApprove, classes, ({ address }) =>
    approveNewNodeForExistingOrganization(address)
  );
  const existingOrgaNodesListEntries = getListEntries(existingOrgaNodes, canApprove, classes, ({ address }) =>
    approveNewNodeForExistingOrganization(address)
  );

  return (
    <div className={classes.container}>
      <Card className={classes.card}>
        <CardHeader title={strings.nodesDashboard.new_organization} />
        <CardContent style={styles.cardContent}>
          <List>{newOrgaNodes.length ? newOrgaNodesListEntries : <EmptyStates.NewOrganizations />}</List>
        </CardContent>
      </Card>
      <Card className={classes.card}>
        <CardHeader title={strings.nodesDashboard.additional_organization_node} />
        <CardContent className={classes.cardContent}>
          <List>{existingOrgaNodes.length ? existingOrgaNodesListEntries : <EmptyStates.ExistingNodes />}</List>
        </CardContent>
      </Card>
    </div>
  );
};

export default withStyles(styles)(NodeVoting);
