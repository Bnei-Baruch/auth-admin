import React, { Component } from 'react';
import {Button, Container, Segment, Popup, Table, Icon, Menu, Input, Grid, Header} from "semantic-ui-react";
import {getAuthData} from "../shared/tools";
import {AUTH_API, NEWUSERS_ID} from "../shared/env";

class SearchUsers extends Component {

    state = {
        users: [],
        pending_users: [],
        request_users: [],
        selected_user: "",
        disabled: true,
        loading: true,
        input: "",
        first: 0,
        max: 15,
        user_info: {}
    };

    componentDidMount() {
        getAuthData(`${AUTH_API}/users/${NEWUSERS_ID}`, (users) => {

            users.sort((a, b) => {
                if (a.createdTimestamp < b.createdTimestamp) return 1;
                if (a.createdTimestamp > b.createdTimestamp) return -1;
                return 0;
            });

            this.setState({users, loading: false});
        });
    };

    searchUser = () => {
        const {input} = this.state;
        getAuthData(`${AUTH_API}/search?search=${input}&max=100`, (users) => {
            users.sort((a, b) => {
                if (a.createdTimestamp < b.createdTimestamp) return 1;
                if (a.createdTimestamp > b.createdTimestamp) return -1;
                return 0;
            });

            this.setState({users, loading: false, input: ""});
            console.log(users)
        });
    };

    getForward = () => {
        let {first, max} = this.state;
        first = first + 15
        this.getData(first, max);
        this.setState({first});
    }

    getReverce = () => {
        let {first, max} = this.state;
        first = first - 15
        if(first < 0) first = 0;
        this.getData(first, max);
        this.setState({first});
    }

    getData = (first, max) => {
        getAuthData(`${AUTH_API}/users/${NEWUSERS_ID}?first=${first}&max=${max}`, (users) => {
            users.sort((a, b) => {
                if (a.createdTimestamp < b.createdTimestamp) return 1;
                if (a.createdTimestamp > b.createdTimestamp) return -1;
                return 0;
            });

            this.setState({users, loading: false, input: ""});
            console.log(users)
        });
    }

    selectUser = (id) => {
        getAuthData(`${AUTH_API}/user/${id}`, (user_info) => {
            this.setState({selected_user: id, user_info});
            console.log(user_info)
        });
    }

    approveUser = () => {
        const {selected_user,users} = this.state;
        console.log(selected_user);
        getAuthData(`${AUTH_API}/approve/${selected_user}`, (response) => {
            for (let i = 0; i < users.length; i++) {
                if (users[i].id === selected_user) {
                    users.splice(i, 1);
                    this.setState({selected_user: "",users});
                    break;
                }
            }
            alert(response.result);
        });
    }

    removeUser = () => {
        const {selected_user,users} = this.state;
        console.log(selected_user);
        getAuthData(`${AUTH_API}/remove/${selected_user}`, (response) => {
            for (let i = 0; i < users.length; i++) {
                if (users[i].id === selected_user) {
                    users.splice(i, 1);
                    this.setState({selected_user: "",users});
                    break;
                }
            }
            alert(response.result);
        });
    }

    setRequest = () => {
        const {input} = this.state;
        console.log(input);
    }

    render() {
        const {users,selected_user,loading,search,input,user_info} = this.state;
        const {groups,roles,social} = user_info;

        let v = (<Icon color='green' name='checkmark'/>);
        let x = (<Icon color='red' name='close'/>);

        const gxy_user = !!roles?.find(r => r.name === "gxy_user")
        const idp = social?.length ? social[0].identityProvider : x
        const grp = groups?.length ? groups[0].name : ""

        let users_content = users.map(user => {
            const {id,firstName,lastName,emailVerified,email,createdTimestamp} = user;
            const reg_time = new Date(createdTimestamp).toUTCString();
            return (<Popup trigger={<Table.Row key={id}
                                               active={id === selected_user}
                                               negative={!emailVerified}
                                               onClick={() => this.selectUser(id, user)} >
                    <Table.Cell>{<Icon name={emailVerified ? 'checkmark' : 'close'} />} - {email}</Table.Cell>
                    <Table.Cell>{firstName}</Table.Cell>
                    <Table.Cell>{lastName}</Table.Cell>
                    <Table.Cell>{reg_time}</Table.Cell>
                </Table.Row>} flowing hoverable on='click'>
                <Table compact='very' structured unstackable singleLine celled>
                    <Table.Row>
                        <Table.Cell width={3}>User ID</Table.Cell>
                        <Table.Cell textAlign='center'>{id}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={3}>Social ID</Table.Cell>
                        <Table.Cell textAlign='center'>{idp}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={2}>Sec Group</Table.Cell>
                        <Table.Cell textAlign='center'>{grp}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={2}>Gxy User</Table.Cell>
                        <Table.Cell textAlign='center'>{gxy_user ? v : x}</Table.Cell>
                    </Table.Row>
                </Table>
            </Popup>
            )
        });

        return (
            <Container fluid >
                <Menu size='large' secondary>
                    <Menu.Item>
                        <Input type='text' placeholder='Search..' action value={input}
                               onChange={(e, { value }) => this.setState({input: value})}>
                            <input />
                            <Button type='submit' color='blue' disabled={input === ""}
                                    onClick={() => this.searchUser(search)}>Search</Button>
                        </Input>
                    </Menu.Item>
                    <Menu.Menu position='left'>
                        <Menu.Item>
                        </Menu.Item>
                        <Menu.Item>
                        </Menu.Item>
                    </Menu.Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Button color='green' disabled onClick={this.approveUser}>Approve</Button>
                        </Menu.Item>
                        <Menu.Item>
                            <Button color='red' disabled icon='close' onClick={this.removeUser} />
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <Segment attached textAlign='center' className="group_list" raised loading={loading} >
                    <Table selectable compact='very' basic structured className="admin_table" unstackable>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={3}>Email</Table.Cell>
                                <Table.Cell width={2}>First Name</Table.Cell>
                                <Table.Cell width={2}>Last Name</Table.Cell>
                                <Table.Cell width={3}>Reg Time</Table.Cell>
                            </Table.Row>
                            {users_content}
                        </Table.Body>
                    </Table>
                </Segment>
                <Button.Group attached='bottom' >
                    <Button icon onClick={this.getReverce} ><Icon name='angle double left' /></Button>
                    <Button icon onClick={this.getForward} ><Icon name='angle double right' /></Button>
                </Button.Group>
            </Container>
        );
    }
}

export default SearchUsers;
