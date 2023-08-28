import React, { Component } from 'react';
import {Button, Container, Segment, Popup, Table, Icon, Menu} from "semantic-ui-react";
import {getAuthData, getVhData} from "../shared/tools";
import {AUTH_API, LOGIN_API, CLIENTS} from "../shared/env";

class VhUsers extends Component {

    state = {
        users: [],
        profile_users: [],
        order_users: [],
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
       this.getData(0, 17)
        getVhData(`pay/payments/activities`, (order_users) => {
            console.log(order_users)
            this.setState({order_users});
        });
        // Object.keys(CLIENTS).map(k => {
        //     getAuthData(`${LOGIN_API}/keycloak/count/${k}`, (data) => {
        //         counts[k].count = data.count;
        //         this.setState({counts});
        //     });
        // })
    };

    getData = (first, max) => {
        getVhData(`profile/v1/profiles?skip=${first}&limit=${max}`, (profile_users) => {
            // users.sort((a, b) => {
            //     if (a.createdTimestamp < b.createdTimestamp) return 1;
            //     if (a.createdTimestamp > b.createdTimestamp) return -1;
            //     return 0;
            // });

            this.setState({profile_users, loading: false, input: ""});
            console.log(profile_users)
        });
    }

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

    selectUser = (id, user) => {
        console.log(user)
        const {search, input, users} = this.state;
        getAuthData(`${AUTH_API}/find?id=${id}`, (response) => {
            getAuthData(`${AUTH_API}/user/${id}`, (user_info) => {
                let user = {...response,...user_info}
                this.setState({selected_user: id, user_info: user});
                console.log(user)
            });
        });
    }

    // approveUser = () => {
    //     const {selected_user,users} = this.state;
    //     console.log(selected_user);
    //     getAuthData(`${AUTH_API}/approve/${selected_user}`, (response) => {
    //         for (let i = 0; i < users.length; i++) {
    //             if (users[i].id === selected_user) {
    //                 users.splice(i, 1);
    //                 this.setState({selected_user: "",users});
    //                 break;
    //             }
    //         }
    //         alert(response.result);
    //     });
    // }
    //
    // removeUser = () => {
    //     const {selected_user,users} = this.state;
    //     console.log(selected_user);
    //     getAuthData(`${AUTH_API}/remove/${selected_user}`, (response) => {
    //         for (let i = 0; i < users.length; i++) {
    //             if (users[i].id === selected_user) {
    //                 users.splice(i, 1);
    //                 this.setState({selected_user: "",users});
    //                 break;
    //             }
    //         }
    //         alert(response.result);
    //     });
    // }

    setRequest = () => {
        const {input} = this.state;
        console.log(input);
    }

    render() {
        const {profile_users, loading, selected_user} = this.state;
        //const {firstName,lastName,groups,roles,social,credentials} = user_info;

        let v = (<Icon color='green' name='checkmark'/>);
        let x = (<Icon color='red' name='close'/>);

        const options = [
            { key: 'email', text: 'Mail', value: 'email' },
            { key: 'id', text: 'UserID', value: 'user_id' },
        ]

        // const gxy_user = !!roles?.find(r => r.name === "gxy_user")
        // const crd = credentials?.length ? credentials[0].type : x
        // const idp = social?.length ? social[0].identityProvider : x
        // const grp = groups?.length ? groups[0].name : ""
        //
        // const buttons = Object.keys(CLIENTS).map(k => {
        //     return (
        //         <Button basic content={CLIENTS[k].name}
        //                 color={selected_client === k ? 'pink' : 'blue'}
        //                 onClick={() => this.setClient(k)}
        //                 icon={CLIENTS[k].icon}
        //                 label={{ as: 'a', basic: true, color: 'blue', content: counts[k].count}} />
        //
        //     )
        // })

        let users_content = profile_users.map(user => {
            const {keycloak_id,first_name_latin,last_name_latin,country,primary_email,created_at,status} = user;
            const {membership,membership_type,ticket,convention,galaxy} = status
            //const created_at = new Date(time).toUTCString();
            return (<Popup trigger={<Table.Row key={keycloak_id}
                                               active={keycloak_id === selected_user}
                                               onClick={() => this.selectUser(keycloak_id, user)} >
                    <Table.Cell>{first_name_latin}</Table.Cell>
                    <Table.Cell>{last_name_latin}</Table.Cell>
                    <Table.Cell>{keycloak_id}</Table.Cell>
                    <Table.Cell>{primary_email}</Table.Cell>
                    <Table.Cell>{country}</Table.Cell>
                    <Table.Cell>{created_at}</Table.Cell>
                    <Table.Cell>{membership_type}</Table.Cell>
                </Table.Row>} flowing hoverable on='click'>
                <Table compact='very' structured unstackable singleLine celled>
                    <Table.Row>
                        <Table.Cell width={3}>First Name</Table.Cell>
                        <Table.Cell textAlign='center'>{membership}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={3}>Last Name</Table.Cell>
                        <Table.Cell textAlign='center'>{membership_type}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={3}>User ID</Table.Cell>
                        <Table.Cell textAlign='center'>{ticket}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={3}>Social ID</Table.Cell>
                        <Table.Cell textAlign='center'>{convention}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={2}>Sec Group</Table.Cell>
                        <Table.Cell textAlign='center'>{galaxy}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={2}>Gxy User</Table.Cell>
                        <Table.Cell textAlign='center'>{created_at}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={2}>Credentials</Table.Cell>
                        <Table.Cell textAlign='center'>{ticket}</Table.Cell>
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
                        {/*<Input type='text' placeholder='Search..' action value={input}*/}
                        {/*       onChange={(e, { value }) => this.setState({input: value})}>*/}
                        {/*    <input />*/}
                        {/*    <Select compact options={options} value={search}*/}
                        {/*            onChange={(e, { value }) => this.setState({search: value})}/>*/}
                        {/*    <Button type='submit' color='blue' disabled={!search}*/}
                        {/*            onClick={() => this.searchUser(search)}>Search</Button>*/}
                        {/*</Input>*/}
                    </Menu.Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                        </Menu.Item>
                        <Menu.Item>
                            {/*<Label as='a' color='blue' ribbon='right' size='large'>*/}
                            {/*    Total Logins Count: {total}*/}
                            {/*</Label>*/}
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <Button.Group attached='top'>
                    {/*{buttons}*/}
                </Button.Group>
                <Segment attached textAlign='center' className="group_list" raised loading={loading} >
                    <Table selectable compact='very' basic structured className="admin_table" unstackable fixed>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={2}>First Name</Table.Cell>
                                <Table.Cell width={2}>Last Name</Table.Cell>
                                <Table.Cell width={4}>User ID</Table.Cell>
                                <Table.Cell width={5}>EMail</Table.Cell>
                                <Table.Cell width={1}>Country</Table.Cell>
                                <Table.Cell width={4}>Created</Table.Cell>
                                <Table.Cell width={2}>Status</Table.Cell>
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

export default VhUsers;
