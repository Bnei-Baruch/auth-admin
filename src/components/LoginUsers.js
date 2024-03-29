import React, { Component } from 'react';
import {Button, Container, Segment, Popup, Table, Icon, Menu, Input, Label, Pagination, Select, Checkbox} from "semantic-ui-react";
import {getAuthData, getVhData} from "../shared/tools";
import {AUTH_API, LOGIN_API, NEWUSERS_ID, CLIENTS} from "../shared/env";
import DatePicker from "react-datepicker";

class LoginUsers extends Component {

    state = {
        all: [],
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
        total: 0,
        page: 1,
        filter: "all",
        date: null,
        days: null,
        vh_true: 0,
        vh_false: 0
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

    setDateFilter = (date) => {
        let timeIval = new Date().getTime() - date.getTime();
        var daysIval = Math.round(timeIval / (1000 * 3600 * 24));
        console.log(daysIval)
        this.setState({date, days: daysIval})
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

    removeFilter = () => {
        const {selected_client} = this.state;
        this.setState({days: null, date: null})
        this.setClient(selected_client)

    }

    setClient = (k) => {
        this.setState({loading: true});
        getAuthData(`${LOGIN_API}/keycloak/logins/${k}?limit=10000`, (users) => {
            this.setState({all: users, selected_client: k, loading: false}, () => {
                this.selectPage(1)
            });
        });
    }

    selectPage = (value) => {
        console.log(value)
        const {all} = this.state;
        const page_number = value;
        const page_size = 100;
        const users = all.slice((page_number - 1) * page_size, page_number * page_size)
        console.log(users)
        this.setState({ users, page: value});
    }

    handleClick = (value) => {
        const {days,selected_client} = this.state;
        if(selected_client === "") return
        if(!this.state.days) return
        this.setState({ filter: value});
        let d = new Date();
        let h = d.setMonth(d.getMonth()-1);

        this.setState({loading: true});

        if(value === "inactive") {
            getAuthData(`${LOGIN_API}/keycloak/time/${selected_client}?before=${days}&limit=10000`, (all) => {
                let vh_true = all.filter(u => u.membership).length
                let vh_false = all.filter(u => !u.membership).length
                this.setState({all, loading: false, vh_true, vh_false}, () => {
                    this.selectPage(1)
                });
            })
        }

        if(value === "active") {
            getAuthData(`${LOGIN_API}/keycloak/time/${selected_client}?after=${days}&limit=10000`, (all) => {
                let vh_true = all.filter(u => u.membership).length
                let vh_false = all.filter(u => !u.membership).length
                this.setState({all, loading: false, vh_true, vh_false}, () => {
                    this.selectPage(1)
                });
            })
        }

        // getAuthData(`${LOGIN_API}/keycloak/logins/${selected_client}?limit=10000`, (users) => {
        //     if(value === "active") {
        //         let a = users.filter(u => u.logins[selected_client]?.time > h);
        //         this.setState({ all: a, loading: false}, () => {
        //             this.selectPage(1)
        //         });
        //     }
        //     if(value === "inactive") {
        //         let a = users.filter(u => u.logins[selected_client]?.time < h);
        //         this.setState({ all: a, loading: false}, () => {
        //             this.selectPage(1)
        //         });
        //     }
        //     if(value === "all") {
        //         this.setState({ all: users, loading: false}, () => {
        //             this.selectPage(1)
        //         });
        //     }
        // });
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
                getVhData(`pay/status/${response.email}`, (vh_status) => {
                    console.log(vh_status)
                    let user = {...response,...user_info,...vh_status}
                    this.setState({selected_user: id, user_info: user});
                    console.log(user)
                });
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
        const {vh_true, vh_false, date, filter, page, all, total, users, selected_client ,selected_user,loading,search,input,user_info, counts} = this.state;
        const {firstName,lastName,groups,roles,social,credentials,membership} = user_info;

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
        const vhs = membership ? v : x;

        const buttons = Object.keys(CLIENTS).map(k => {
            let count = counts[k].count
            if(k === selected_client) {
                count = all.length
            }
            return (
                <Button basic content={CLIENTS[k].name}
                        color={selected_client === k ? 'pink' : 'blue'}
                        onClick={() => this.setClient(k)}
                        icon={CLIENTS[k].icon}
                        label={{ as: 'a', basic: true, color: 'blue', content: count}} />

            )
        })

        let users_content = users.map(user => {
            const {user_id,email,time,logins} = user;
            const login_time = selected_client === "" ? new Date(time).toUTCString() : new Date(logins[selected_client]?.time).toUTCString();
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
                    <Table.Row>
                        <Table.Cell width={2}>Membership</Table.Cell>
                        <Table.Cell textAlign='center'>{vhs}</Table.Cell>
                    </Table.Row>
                </Table>
            </Popup>
            )
        });

        return (
            <Container fluid>
                <Menu size='large' secondary>
                    <Menu.Menu position='left'>
                        <Menu.Item>
                            <DatePicker
                                // locale={locale}
                                customInput={<Input icon={
                                    <Icon name={date ? 'close' : 'dropdown'} link onClick={() => this.removeFilter("date")} />
                                }/>}
                                dateFormat="yyyy-MM-dd"
                                // showYearDropdown
                                // showMonthDropdown
                                // scrollableYearDropdown
                                maxDate={new Date()}
                                openToDate={new Date()}
                                selected={date ? date : null}
                                placeholderText="Date:"
                                onChange={this.setDateFilter}
                            />
                        </Menu.Item>
                        <Menu.Item>
                            <Button.Group>
                                <Button disabled={!selected_client} onClick={() => this.handleClick("active")}>Active</Button>
                                <Button disabled={!selected_client} onClick={() => this.handleClick("inactive")}>Inactive</Button>
                                {/*<Button disabled={filter === "all"} onClick={() => this.handleClick("all")}>All</Button>*/}
                            </Button.Group>
                        </Menu.Item>
                        <Menu.Item>
                            {selected_client === "galaxy" && <Checkbox label={`Membership: ${vh_true}`} checked={true} />}
                        </Menu.Item>
                        <Menu.Item>
                            {selected_client === "galaxy" && <Checkbox label={`Membership: ${vh_false}`} checked={false} />}
                        </Menu.Item>
                    </Menu.Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Input type='text' placeholder='Search..' action value={input}
                                   onChange={(e, { value }) => this.setState({input: value})}>
                                <input />
                                <Select compact options={options} value={search}
                                        onChange={(e, { value }) => this.setState({search: value})}/>
                                <Button type='submit' color='blue' disabled={!search}
                                        onClick={() => this.searchUser(search)}>Search</Button>
                            </Input>
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
                    <Table selectable compact='very' basic structured className="admin_table" unstackable fixed>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={4}>Email</Table.Cell>
                                <Table.Cell width={5}>User ID</Table.Cell>
                                <Table.Cell width={4}>Last Login</Table.Cell>
                                {Object.keys(CLIENTS).map(k => {
                                    return (<Table.Cell width={1}><Icon name={CLIENTS[k].icon} /></Table.Cell>)})}
                            </Table.Row>
                            {users_content}
                        </Table.Body>
                    </Table>
                </Segment>
                <Pagination pointing
                            secondary
                            defaultActivePage={1}
                            activePage={page}
                            onPageChange={(e, { activePage }) => this.selectPage(activePage)}
                            totalPages={Math.round(all.length/100)} />
            </Container>
        );
    }
}

export default LoginUsers;
