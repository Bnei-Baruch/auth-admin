import React, { Component } from 'react';
import {Container, Segment, Table, Icon, Menu, Popup, Label, Divider} from "semantic-ui-react";
import {getAuthData} from "../shared/tools";
import {AUTH_API, IGNORED_ID} from "../shared/env";

class VerifyUsers extends Component {

    state = {
        users: [],
        ignored_users: [],
        selected_user: "",
        disabled: true,
        loading: true,
        input: "",
    };

    componentDidMount() {
        getAuthData(`${AUTH_API}/vusers`, (users) => {
            this.setState({users, loading: false});
        });
        getAuthData(`${AUTH_API}/users/${IGNORED_ID}`, (ignored_users) => {
            this.setState({ignored_users});
        });
    };

    selectUser = (user) => {
        this.setState({selected_user: user});
        console.log(user)
    };

    render() {
        const {users,selected_user,loading,ignored_users} = this.state;

        let users_content = users.map(user => {
            const {id,firstName,lastName,emailVerified,email,attributes} = user;
            const verify = attributes.approved[0];
            const emails_count = attributes.approved.length;
            const popup = emails_count > 1 ? <Popup on='hover' position='top right' trigger={
                <Label><Icon name='mail' />{emails_count}</Label>
            } content={
                attributes.approved.map(data => {return (<p key={data}>{data}</p>)})
            } /> : "";
            return (
                <Table.Row key={id}
                           active={id === selected_user}
                           negative={!emailVerified}
                           onClick={() => this.selectUser(user)} >
                    <Table.Cell>{email}</Table.Cell>
                    <Table.Cell>{firstName}</Table.Cell>
                    <Table.Cell>{lastName}</Table.Cell>
                    <Table.Cell><Icon name='checkmark' /> {verify}</Table.Cell>
                    <Table.Cell>{popup}</Table.Cell>
                </Table.Row>
            )
        })

        let users_ignored = ignored_users.map(user => {
            const {id,firstName,lastName,email,createdTimestamp,attributes} = user;
            const request = attributes && attributes.request !== undefined;
            const req_user = request ? attributes.request[0] : "";
            const reg_time = new Date(createdTimestamp).toUTCString();
            return (
                <Table.Row key={id}
                           active={id === selected_user}
                           negative={true}
                           onClick={() => this.selectUser(user)} >
                    <Table.Cell>{email}</Table.Cell>
                    <Table.Cell>{firstName}</Table.Cell>
                    <Table.Cell>{lastName}</Table.Cell>
                    <Table.Cell>{reg_time}</Table.Cell>
                    <Table.Cell><b>{req_user}</b></Table.Cell>
                </Table.Row>
            )
        })

        return (
            <Container fluid >
                <Menu size='large' secondary>
                    <Menu.Item>
                    </Menu.Item>
                    <Menu.Menu position='left'>
                        <Menu.Item>
                        </Menu.Item>
                        <Menu.Item>
                        </Menu.Item>
                    </Menu.Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                        </Menu.Item>
                        <Menu.Item>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <Segment textAlign='center' className="group_list" raised loading={loading}>
                    <Table selectable compact='very' basic structured className="admin_table" unstackable>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={2}>Email</Table.Cell>
                                <Table.Cell width={2}>First Name</Table.Cell>
                                <Table.Cell width={2}>Last Name</Table.Cell>
                                <Table.Cell width={2}>Reg Time</Table.Cell>
                                <Table.Cell width={1}>Ignored by</Table.Cell>
                            </Table.Row>
                            {users_ignored}
                        </Table.Body>
                    </Table>
                    <Divider />
                    <Table selectable compact='very' basic structured className="admin_table" unstackable>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={2}>Email</Table.Cell>
                                <Table.Cell width={2}>First Name</Table.Cell>
                                <Table.Cell width={2}>Last Name</Table.Cell>
                                <Table.Cell width={2}>Verify</Table.Cell>
                                <Table.Cell width={1}>Count</Table.Cell>
                            </Table.Row>
                            {users_content}
                        </Table.Body>
                    </Table>
                </Segment>
            </Container>
        );
    }
}

export default VerifyUsers;