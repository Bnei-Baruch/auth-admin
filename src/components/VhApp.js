import React, { Component } from 'react';
import {Segment, Tab} from 'semantic-ui-react'
import LoginPage from './LoginPage';
import VhUsers from "./VhUsers";
import kc from "./UserManager";
import VhHome from "./VhHome";
import VhActivity from "./VhActivity";


class VhApp extends Component {

    state = {
        auth_admin: kc.hasRealmRole("auth_admin"),
        auth_root: kc.hasRealmRole("auth_root"),
        vh_admin: kc.hasRealmRole("auth_root") || kc.hasRealmRole("vh_admin")
    };

    checkPermission = (user) => {
        const auth_admin = kc.hasRealmRole("auth_admin");
        const auth_root = kc.hasRealmRole("auth_root");
        const vh_admin = auth_root || kc.hasRealmRole("vh_admin");
        if(auth_root || auth_admin || vh_admin) {
            this.setState({user, auth_admin, vh_admin});
        } else {
            alert("Access denied!");
            kc.logout();
        }
    };

    render() {

        const {vh_admin, auth_admin,user} = this.state;

        let login = (<LoginPage user={user} checkPermission={this.checkPermission} />);

        const panes = [
            { menuItem: { key: 'Home', icon: '', content: '', disabled: false },
                render: () => <Tab.Pane attached={true} ><VhHome /></Tab.Pane> },
            { menuItem: { key: 'vh', icon: 'users', content: 'Users', disabled: !vh_admin },
                render: () => <Tab.Pane attached={false} ><VhUsers user={this.props.user} /></Tab.Pane> },
            { menuItem: { key: 'ac', icon: 'truck', content: 'Activity', disabled: !vh_admin },
                render: () => <Tab.Pane attached={false} ><VhActivity user={this.props.user} /></Tab.Pane> },
        ];

        const wf_panes = panes.filter(p => !p.menuItem.disabled);

        return (
            <Segment basic padded>
                <Tab menu={{ pointing: true }} panes={wf_panes} />
            </Segment>
        );
    }
}

export default VhApp;
