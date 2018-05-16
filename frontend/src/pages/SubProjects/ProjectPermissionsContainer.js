import React, { Component } from "react";
import { connect } from "react-redux";

import PermissionsScreen from "../Common/Permissions/PermissionsScreen";
import { fetchProjectPermissions, hideProjectPermissions, grantPermission } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";
import { projectIntentOrder } from "../../permissions";

class ProjectPermissionsContainer extends Component {
  componentWillReceiveProps(nextProps) {
    if (!this.props.show && nextProps.show) {
      this.props.fetchUser(true);
      this.props.fetchProjectPermissions(this.props.id, true);
    }
  }

  render() {
    return <PermissionsScreen {...this.props} intentOrder={projectIntentOrder} />;
  }
}

const mapStateToProps = state => {
  return {
    permissions: state.getIn(["detailview", "permissions"]),
    user: state.getIn(["login", "user"]),
    show: state.getIn(["detailview", "permissionDialogShown"]),
    id: state.getIn(["detailview", "id"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => dispatch(hideProjectPermissions()),
    grantPermission: (projectId, permission, user) => dispatch(grantPermission(projectId, permission, user, true)),
    fetchProjectPermissions: (projectId, showLoading) => dispatch(fetchProjectPermissions(projectId, showLoading)),
    fetchUser: showLoading => dispatch(fetchUser(showLoading))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(ProjectPermissionsContainer)));
