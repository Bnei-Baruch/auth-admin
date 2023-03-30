import React, { Component } from 'react';
import {Button, Container, Segment, Popup, Table, Icon, Menu, Input, Label, Header, Select} from "semantic-ui-react";
import {getAuthData} from "../shared/tools";
import {AUTH_API, LOGIN_API, NEWUSERS_ID, CLIENTS} from "../shared/env";

class LoginUsers extends Component {

    state = {
        users: [],
        pending_users: [],
        request_users: [],
        selected_user: "",
        selected_client: "",
        search: "email",
        disabled: true,
        loading: true,
        input: "",
        first: 0,
        max: 15,
        user_info: {},
        counts: CLIENTS,
        total: 0
    };

    componentDidMount() {
        const {counts} = this.state;
        getAuthData(`${LOGIN_API}/keycloak/count/total`, (data) => {
            this.setState({total: data.count});
        });
        getAuthData(`${LOGIN_API}/keycloak/logins`, (users) => {
            this.setState({users, loading: false});
        });
        Object.keys(CLIENTS).map(k => {
            getAuthData(`${LOGIN_API}/keycloak/count/${k}`, (data) => {
                counts[k].count = data.count;
                this.setState({counts});
            });
        })
    };

    searchUser = () => {
        const {search, input, users} = this.state;
        getAuthData(`${LOGIN_API}/users/kv?${search}=${input}`, (users) => {
            console.log(users)
            this.setState({users, input: ""});
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

    setClient = (k) => {
        getAuthData(`${LOGIN_API}/keycloak/logins/${k}`, (users) => {
            this.setState({users, selected_client: k});
        });
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
        const {search, input, users} = this.state;
        getAuthData(`${AUTH_API}/find?id=${id}`, (response) => {
            getAuthData(`${AUTH_API}/user/${id}`, (user_info) => {
                let user = {...response,...user_info}
                this.setState({selected_user: id, user_info: user});
                console.log(user)
            });
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
        const {total, users, selected_client ,selected_user,loading,search,input,user_info, counts} = this.state;
        const {firstName,lastName,groups,roles,social,credentials} = user_info;

        let v = (<Icon color='green' name='checkmark'/>);
        let x = (<Icon color='red' name='close'/>);

        const options = [
            { key: 'email', text: 'Mail', value: 'email' },
            { key: 'id', text: 'UserID', value: 'user_id' },
        ]

        const gxy_user = !!roles?.find(r => r.name === "gxy_user")
        const crd = credentials?.length ? credentials[0].type : x
        const idp = social?.length ? social[0].identityProvider : x
        const grp = groups?.length ? groups[0].name : ""

        const buttons = Object.keys(CLIENTS).map(k => {
            return (
                <Button basic content={CLIENTS[k].name}
                        color={selected_client === k ? 'pink' : 'blue'}
                        onClick={() => this.setClient(k)}
                        icon={CLIENTS[k].icon}
                        label={{ as: 'a', basic: true, color: 'blue', content: counts[k].count}} />

            )
        })

        let users_content = users.map(user => {
            const {user_id,email,time,logins} = user;
            const login_time = new Date(time).toUTCString();
            return (<Popup trigger={<Table.Row key={user_id}
                                               active={user_id === selected_user}
                                               onClick={() => this.selectUser(user_id, user)} >
                    <Table.Cell>{email}</Table.Cell>
                    <Table.Cell>{user_id}</Table.Cell>
                    <Table.Cell>{login_time}</Table.Cell>
                    {Object.keys(CLIENTS).map(k => {
                        const st = logins[k] ? v : x
                        return (<Table.Cell width={1}>{st}</Table.Cell>)})}
                </Table.Row>} flowing hoverable on='click'>
                <Table compact='very' structured unstackable singleLine celled>
                    <Table.Row>
                        <Table.Cell width={3}>First Name</Table.Cell>
                        <Table.Cell textAlign='center'>{firstName}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={3}>Last Name</Table.Cell>
                        <Table.Cell textAlign='center'>{lastName}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={3}>User ID</Table.Cell>
                        <Table.Cell textAlign='center'>{user_id}</Table.Cell>
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
                    <Table.Row>
                        <Table.Cell width={2}>Credentials</Table.Cell>
                        <Table.Cell textAlign='center'>{crd}</Table.Cell>
                    </Table.Row>
                </Table>
            </Popup>
            )
        });

        return (
            <Container fluid>
                <Menu size='large' secondary>
                    <Menu.Item>
                    </Menu.Item>
                    <Menu.Menu position='left'>
                        <Input type='text' placeholder='Search..' action value={input}
                               onChange={(e, { value }) => this.setState({input: value})}>
                            <input />
                            <Select compact options={options} value={search}
                                    onChange={(e, { value }) => this.setState({search: value})}/>
                            <Button type='submit' color='blue' disabled={!search}
                                    onClick={() => this.searchUser(search)}>Search</Button>
                        </Input>
                    </Menu.Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                        </Menu.Item>
                        <Menu.Item>
                            <Label as='a' color='blue' ribbon='right' size='large'>
                                Total Logins Count: {total}
                            </Label>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <Button.Group attached='top'>
                    {buttons}
                </Button.Group>
                <Segment attached textAlign='center' className="group_list" raised loading={loading} >
                    <Table selectable compact='very' basic structured className="admin_table" unstackable>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={2}>Email</Table.Cell>
                                <Table.Cell width={5}>User ID</Table.Cell>
                                <Table.Cell width={4}>Last Login</Table.Cell>
                                {Object.keys(CLIENTS).map(k => {
                                    return (<Table.Cell width={1}><Icon name={CLIENTS[k].icon} /></Table.Cell>)})}
                            </Table.Row>
                            {users_content}
                        </Table.Body>
                    </Table>
                </Segment>
                {/*<Button.Group attached='bottom' >*/}
                {/*    <Button icon onClick={this.getReverce} ><Icon name='angle double left' /></Button>*/}
                {/*    <Button icon onClick={this.getForward} ><Icon name='angle double right' /></Button>*/}
                {/*</Button.Group>*/}
            </Container>
        );
    }
}

export default LoginUsers;
