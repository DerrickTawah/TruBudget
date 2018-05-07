import React from "react";
import { Card } from "material-ui/Card";

import GroupIcon from "material-ui/svg-icons/social/group";
import UsersIcon from "material-ui/svg-icons/social/person";
import OrgaIcon from "material-ui/svg-icons/maps/store-mall-directory";
import CardHeader from "material-ui/Card/CardHeader";
import CountUp from "react-countup";

const styles = {
  container: {
    marginTop: 70,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  card: {
    width: "30%",
    maxWidth: "300px",
    height: 250
  },
  cardDiv: {
    width: "100%",
    height: 150,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  cardHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  icon: {
    width: 100,
    height: 100
  },
  headerText: {
    paddingRight: 0
  },
  headerFont: {
    fontSize: "25px"
  }
};

const Title = ({ count, text }) => {
  const startValue = count - 100;
  return (
    <div>
      <CountUp start={startValue > 0 ? startValue : 0} end={count} />
      <span> {text} </span>
    </div>
  );
};

const UserStats = () => (
  <div style={styles.container}>
    <Card style={styles.card}>
      <div style={styles.cardDiv}>
        <OrgaIcon style={styles.icon} />
      </div>
      <div style={styles.cardHeader}>
        <CardHeader
          textStyle={styles.headerText}
          titleStyle={styles.headerFont}
          title={<Title count={38} text={"Organisation"} />}
        />
      </div>
    </Card>
    <Card style={styles.card}>
      <div style={styles.cardDiv}>
        <GroupIcon style={styles.icon} />
      </div>
      <div style={styles.cardHeader}>
        <CardHeader
          textStyle={styles.headerText}
          titleStyle={styles.headerFont}
          title={<Title count={47} text={"Groups"} />}
        />
      </div>
    </Card>
    <Card style={styles.card}>
      <div style={styles.cardDiv}>
        <UsersIcon style={styles.icon} />
      </div>
      <div style={styles.cardHeader}>
        <CardHeader
          textStyle={styles.headerText}
          titleStyle={styles.headerFont}
          title={<Title count={94} text={"Users"} />}
        />
      </div>
    </Card>
  </div>
);
export default UserStats;
