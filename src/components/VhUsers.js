import React, { Component } from 'react';
import {Button, Container, Segment, Popup, Table, Icon, Menu, Dropdown, Input, Message} from "semantic-ui-react";
import DatePicker from "react-datepicker";
import {getAuthData, getVhData} from "../shared/tools";
import {AUTH_API, LOGIN_API, CLIENTS, lang_options, status_options, mem_status_options} from "../shared/env";

class VhUsers extends Component {

    state = {
        filters: {},
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
        status_from_order: {},
        counts: CLIENTS,
        total: 0,
        language: "",
        date: null,
        "membership-type": ""
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
        const {filters} = this.state;
        let empty = Object.keys(filters).length === 0
        const query = Object.keys(filters).map(f => f + "=" + filters[f]);
        let path = empty ? `profile/v1/profiles?skip=${first}&limit=${max}` : `profile/v1/profiles?skip=${first}&limit=${max}&`+ query.join('&');
        getVhData(path, (profile_users) => {
            // users.sort((a, b) => {
            //     if (a.createdTimestamp < b.createdTimestamp) return 1;
            //     if (a.createdTimestamp > b.createdTimestamp) return -1;
            //     return 0;
            // });

            this.setState({profile_users, loading: false, input: ""});
            console.log(profile_users)
        });
    };

    setFilter = (key, value) => {
        if(!key) {
            this.removeFilter(key);
            return
        }
        const {filters} = this.state;
        filters[key] = value
        this.setState({filters}, () => {
            this.getData(0, 17);
        });
    };

    setLangFilter = (language) => {
        if(!language) {
            this.removeFilter("language");
            return
        }
        const {filters} = this.state;
        filters.language = language
        this.setState({filters, language}, () => {
            this.getData(0, 17);
        });
    };

    setDateFilter = (date) => {
        if(!date) {
            this.removeFilter("date");
            return
        }
        const {filters} = this.state;
        filters.date = date.toLocaleDateString('sv');
        this.setState({filters, date}, () => {
            this.getData(0, 17);
        });
    };

    setStatusFilter = (status) => {
        if(!status) {
            this.removeFilter("membership-type");
            return
        }
        const {filters} = this.state;
        filters["membership-type"] = status
        this.setState({filters, status}, () => {
            this.getData(0, 17);
        });
    };

    removeFilter = (f) => {
        const {filters} = this.state;
        delete filters[f];
        const value = f === "film_date" ? null : "";
        this.setState({filters, [f]: value}, () => {
            this.getData(0, 17);
        });
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

    selectUser = (id, user) => {
        console.log(user)
        getVhData(`pay/payments/all/${user.primary_email}`, (user) => {
            // users.sort((a, b) => {
            //     if (a.createdTimestamp < b.createdTimestamp) return 1;
            //     if (a.createdTimestamp > b.createdTimestamp) return -1;
            //     return 0;
            // });

            //this.setState({profile_users, loading: false, input: ""});
            console.log(user)
        });
        getVhData(`pay/status/${user.primary_email}`, (status_from_order) => {
            this.setState({status_from_order})
            console.log(status_from_order)
        });
        const {search, input, users} = this.state;
        // getAuthData(`${AUTH_API}/find?id=${id}`, (response) => {
        //     getAuthData(`${AUTH_API}/user/${id}`, (user_info) => {
        //         let user = {...response,...user_info}
        //         this.setState({selected_user: id, user_info: user});
        //         console.log(user)
        //     });
        // });
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
        const {profile_users, loading, selected_user, status_from_order, language, date,status} = this.state;

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
            const {keycloak_id,first_name_latin,last_name_latin,country,city,first_language,primary_email,created_at,study_start_year,status} = user;
            const {membership,membership_type,ticket,convention,galaxy} = status
            //const created_at = new Date(time).toUTCString();
            return (<Popup trigger={<Table.Row key={keycloak_id}
                                               active={keycloak_id === selected_user}
                                               onClick={() => this.selectUser(keycloak_id, user)} >
                    <Table.Cell>{first_name_latin}</Table.Cell>
                    <Table.Cell>{last_name_latin}</Table.Cell>
                    <Table.Cell>{keycloak_id}</Table.Cell>
                    <Table.Cell>{primary_email}</Table.Cell>
                    <Table.Cell>{study_start_year}</Table.Cell>
                    <Table.Cell>{country}</Table.Cell>
                    <Table.Cell>{city}</Table.Cell>
                    <Table.Cell>{first_language}</Table.Cell>
                    <Table.Cell>{created_at}</Table.Cell>
                    <Table.Cell>{membership_type}</Table.Cell>
                </Table.Row>} flowing hoverable on='click'>
                <Table compact='very' structured unstackable singleLine celled>
                    <Table.Row>
                        <Table.Cell width={3}>Special</Table.Cell>
                        <Table.Cell textAlign='center'>{status_from_order.is_special ? v : x}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={3}>Membership</Table.Cell>
                        <Table.Cell textAlign='center'>{status_from_order.membership ? v : x}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={3}>Status</Table.Cell>
                        <Table.Cell textAlign='center'>{status_from_order.status_name}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={3}>Ticket</Table.Cell>
                        <Table.Cell textAlign='center'>{status_from_order.ticket ? v : x}</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell width={2}>Color</Table.Cell>
                        <Table.Cell textAlign='center'>{status_from_order.status_color}</Table.Cell>
                    </Table.Row>
                </Table>
            </Popup>
            )
        });

        return (
            <Container fluid>
                <Message size='large'>
                <Menu size='large' secondary>
                    <Menu.Item>
                        <Dropdown
                            placeholder="Language:"
                            selection
                            clearable
                            options={lang_options}
                            language={language}
                            onChange={(e, {value}) => this.setLangFilter(value)}
                            value={language}>
                        </Dropdown>
                        <DatePicker disabled
                            // locale={locale}
                            customInput={<Input icon={
                                <Icon name={date ? 'close' : 'dropdown'} link onClick={() => this.removeFilter("date")} />
                            }/>}
                            dateFormat="yyyy-MM-dd"
                            showYearDropdown
                            showMonthDropdown
                            scrollableYearDropdown
                            maxDate={new Date()}
                            openToDate={new Date()}
                            selected={date ? date : null}
                            placeholderText="Date:"
                            onChange={this.setDateFilter}
                        />
                    </Menu.Item>
                    <Menu.Menu>

                    </Menu.Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Dropdown
                                placeholder="Status:"
                                selection
                                clearable
                                options={mem_status_options}
                                status={status}
                                onChange={(e, {value}) => this.setStatusFilter(value)}
                                value={status}>
                            </Dropdown>
                        </Menu.Item>
                        <Menu.Item>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                </Message>
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
                                <Table.Cell width={4}>EMail</Table.Cell>
                                <Table.Cell width={1}>Study</Table.Cell>
                                <Table.Cell width={1}>Country</Table.Cell>
                                <Table.Cell width={2}>City</Table.Cell>
                                <Table.Cell width={1}>Language</Table.Cell>
                                <Table.Cell width={4}>Created</Table.Cell>
                                <Table.Cell width={1}>Status</Table.Cell>
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
