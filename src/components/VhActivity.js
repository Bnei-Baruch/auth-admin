import React, { Component } from 'react';
import {
    Button,
    Container,
    Segment,
    Popup,
    Table,
    Icon,
    Menu,
    Dropdown,
    Input,
    Message,
    Select, Pagination, Label
} from "semantic-ui-react";
import DatePicker from "react-datepicker";
import {getAuthData, getVhData} from "../shared/tools";
import {AUTH_API, LOGIN_API, CLIENTS, lang_options, mem_status_options} from "../shared/env";
import VhEdit from "./VhEdit";

class VhActivity extends Component {

    state = {
        all: [],
        page_size: 20,
        filters: {},
        users: [],
        profile_users: [],
        order_users: [],
        orders: [],
        payments: [],
        selected_user: "",
        selected_client: "",
        search: "email",
        disabled: true,
        loading: true,
        input: "",
        first: 0,
        max: 20,
        user_info: {},
        status_from_order: {},
        counts: CLIENTS,
        total: 0,
        language: "",
        date: null,
        membership_type: "",
        open_edit: false,
        page: 1,
    };

    componentDidMount() {
       //this.getData(0, 17)
        getVhData(`pay/payments/activities?skip=0&limit=100`, (order_users) => {
            console.log("ACTIVITIES", order_users)
            this.setState({order_users: order_users.data, loading: false});
        });
    };

    getData = (first) => {
        this.setState({loading: true});
        const {filters, max} = this.state;
        let empty = Object.keys(filters).length === 0
        const query = Object.keys(filters).map(f => f + "=" + filters[f]);
        let path = empty ? `pay/payments/activities?skip=${first}&limit=${max}` : `pay/payments/activities?skip=${first}&limit=${max}&`+ query.join('&');
        getVhData(path, (order_users) => {
            this.setState({order_users: order_users.data, loading: false});
            console.log(order_users)
        });
    };

    setPageSize = (value) => {
        this.setState({max: value})
    }

    selectPage = (value) => {
        console.log(value)
        const {users, page_size} = this.state;
        const page_number = value;
        const profile_users = users.slice((page_number - 1) * page_size, page_number * page_size)
        console.log(profile_users)
        this.setState({ profile_users, page: value});
    };

    filterAction = () => {
        let {filters, all, users} = this.state;
        users = Array.from(all)
        Object.keys(filters).map(k => {
            if(k === "membership_type") {
                users = users.filter(u => u.status[k] === filters[k])
            } else {
                users = users.filter(u => u[k] === filters[k])
            }
        })
        this.setState({users}, () => {
            this.selectPage(1)
        });
    }

    setLangFilter = (language) => {
        let {filters} = this.state;
        if(!language) {
            delete filters["first_language"];
            this.setState({filters, language: ""}, () => {
                this.filterAction()
            });
            return
        }
        filters.first_language = language
        this.setState({filters, language}, () => {
            this.filterAction()
        });
    };

    setDateFilter = (date) => {
        const {filters} = this.state;
        if(!date) {
            delete filters["date"];
            this.setState({filters, date: ""}, () => {
                this.getData(0, 17);
            });
            return
        }
        filters.date = date.toLocaleDateString('sv');
        this.setState({filters, date}, () => {
            this.getData(0, 17);
        });
    };

    setStatusFilter = (membership_type)=> {
        let {filters} = this.state;
        if(!membership_type) {
            delete filters["membership_type"];
            this.setState({filters, membership_type: ""}, () => {
                this.filterAction()
            });
            return
        }
        filters.membership_type = membership_type
        this.setState({filters, membership_type}, () => {
            this.filterAction()
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

    selectUser = (email, user) => {
        console.log(user)
        getVhData(`pay/payments/all/${email}`, (payments) => {
            this.setState({payments})
            console.log("PAYMENTS", payments)
        });
        getVhData(`pay/v2/orders?email=${email}`, (orders) => {
            this.setState({orders})
            console.log("ORDERS", orders)
        });
        getVhData(`pay/status/${email}`, (status_from_order) => {
            this.setState({status_from_order})
            console.log(status_from_order)
        });
        getVhData(`profile/v1/profiles?email=${email}`, (profile_users) => {
            this.setState({selected_user: profile_users[0], open_edit: true});
            console.log(profile_users)
        });
        //this.setState({selected_user: user, open_edit: true});
        // const {search, input, users} = this.state;
        // getAuthData(`${AUTH_API}/find?id=${id}`, (response) => {
        //     getAuthData(`${AUTH_API}/user/${id}`, (user_info) => {
        //         let kc_user = {...response,...user_info}
        //         this.setState({selected_user: user, user_info: kc_user, open_edit: true});
        //         console.log(kc_user)
        //     });
        // });
    }

    clearSelection = () => {
        this.setState({selected_user: "", open_edit: false})
    }

    setRequest = () => {
        const {input} = this.state;
        console.log(input);
    }

    searchUser = () => {
        this.setState({loading: true});
        const {search, input, users} = this.state;
        //let path = empty ? `profile/v1/profiles?skip=${first}&limit=${max}` : `profile/v1/profiles?skip=${first}&limit=${max}&`+ query.join('&');
        getVhData(`profile/v1/profiles?${search}=${input}`, (profile_users) => {
            this.setState({profile_users, loading: false, input: ""});
            console.log(profile_users)
        });
        // getAuthData(`${AUTH_API}/find?${search}=${input}`, (response) => {
        //     users.push(response)
        //     console.log(response)
        //     this.setState({input: ""});
        // });
    };

    render() {
        const {page_size, users, page, order_users, loading, selected_user, max, language, date,membership_type, input, search} = this.state;

        let v = (<Icon color='green' name='checkmark'/>);
        let x = (<Icon color='red' name='close'/>);

        const options = [
            { key: 'email', text: 'Mail', value: 'email' },
            { key: 'name', text: 'Name', value: 'name' },
        ]

        const max_options = [
            { key: 'l1', text: '10', value: 10 },
            { key: 'l2', text: '20', value: 20 },
            { key: 'l3', text: '50', value: 50 },
            { key: 'l4', text: '100', value: 100 },
            { key: 'l5', text: '500', value: 500 },
            { key: 'l6', text: '1000', value: 1000 },
        ]

        let users_content = order_users.map(user => {
            const {additional_details_param_x,amount,cc_exp_date,country,created_at,currency,email,first_name,last_name,order_id,payment_status,payment_type,product_type,type} = user;
            const {membership,membership_type,ticket,convention,galaxy} = status
            //const created_at = new Date(time).toUTCString();
            return (<Table.Row key={order_id}
                               active={email === selected_user}
                               onClick={() => this.selectUser(email, user)} >
                    <Table.Cell>{additional_details_param_x}</Table.Cell>
                    <Table.Cell>{amount}</Table.Cell>
                    <Table.Cell>{cc_exp_date}</Table.Cell>
                    <Table.Cell>{country}</Table.Cell>
                    <Table.Cell>{created_at}</Table.Cell>
                    <Table.Cell>{currency}</Table.Cell>
                    <Table.Cell>{email}</Table.Cell>
                    <Table.Cell>{first_name}</Table.Cell>
                    <Table.Cell>{last_name}</Table.Cell>
                    <Table.Cell>{order_id}</Table.Cell>
                    <Table.Cell>{payment_status}</Table.Cell>
                    <Table.Cell>{payment_type}</Table.Cell>
                    <Table.Cell>{product_type}</Table.Cell>
                    <Table.Cell>{type}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Container fluid>
                <Message size='large'>
                <Menu size='large' secondary>
                    <Menu.Item>
                        <Menu.Item>
                            {/*<Input type='text' placeholder='Search..' action value={input}*/}
                            {/*       onChange={(e, { value }) => this.setState({input: value})}>*/}
                            {/*    <input />*/}
                            {/*    <Select compact options={options} value={search}*/}
                            {/*            onChange={(e, { value }) => this.setState({search: value})}/>*/}
                            {/*    <Button type='submit' color='blue' disabled={!search}*/}
                            {/*            onClick={() => this.searchUser(search)}>Search</Button>*/}
                            {/*</Input>*/}
                        </Menu.Item>
                        {/*<DatePicker disabled*/}
                        {/*    // locale={locale}*/}
                        {/*    customInput={<Input icon={*/}
                        {/*        <Icon name={date ? 'close' : 'dropdown'} link onClick={() => this.removeFilter("date")} />*/}
                        {/*    }/>}*/}
                        {/*    dateFormat="yyyy-MM-dd"*/}
                        {/*    showYearDropdown*/}
                        {/*    showMonthDropdown*/}
                        {/*    scrollableYearDropdown*/}
                        {/*    maxDate={new Date()}*/}
                        {/*    openToDate={new Date()}*/}
                        {/*    selected={date ? date : null}*/}
                        {/*    placeholderText="Date:"*/}
                        {/*    onChange={this.setDateFilter}*/}
                        {/*/>*/}
                    </Menu.Item>
                    <Menu.Menu>

                    </Menu.Menu>
                    <Menu.Menu position='right'>
                        {/*<Menu.Item>*/}
                        {/*    <Dropdown*/}
                        {/*        placeholder="Language:"*/}
                        {/*        selection*/}
                        {/*        clearable*/}
                        {/*        options={lang_options}*/}
                        {/*        language={language}*/}
                        {/*        onChange={(e, {value}) => this.setLangFilter(value)}*/}
                        {/*        value={language}>*/}
                        {/*    </Dropdown>*/}
                        {/*    <Dropdown*/}
                        {/*        placeholder="Status:"*/}
                        {/*        selection*/}
                        {/*        clearable*/}
                        {/*        options={mem_status_options}*/}
                        {/*        onChange={(e, {value}) => this.setStatusFilter(value)}*/}
                        {/*        value={membership_type}>*/}
                        {/*    </Dropdown>*/}
                        {/*</Menu.Item>*/}
                        {/*<Menu.Item>*/}
                        {/*    <Label size="big">*/}
                        {/*        {users.length}*/}
                        {/*    </Label>*/}
                        {/*</Menu.Item>*/}
                    </Menu.Menu>
                </Menu>
                </Message>
                <Button.Group attached='top'>
                    {/*{buttons}*/}
                </Button.Group>
                <VhEdit
                    {...this.state}
                    setProps={(props) => this.setState({...props})}
                    closeModal={this.clearSelection} />
                <Segment attached textAlign='center' className="group_list" raised loading={loading} >
                    <Table selectable compact='very' basic structured className="admin_table" unstackable fixed>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={2}>additional_details_param_x</Table.Cell>
                                <Table.Cell width={1}>amount</Table.Cell>
                                <Table.Cell width={1}>cc_exp_date</Table.Cell>
                                <Table.Cell width={2}>country</Table.Cell>
                                <Table.Cell width={3}>created_at</Table.Cell>
                                <Table.Cell width={1}>currency</Table.Cell>
                                <Table.Cell width={2}>email</Table.Cell>
                                <Table.Cell width={2}>first_name</Table.Cell>
                                <Table.Cell width={2}>last_name</Table.Cell>
                                <Table.Cell width={1}>order_id</Table.Cell>
                                <Table.Cell width={1}>payment_status</Table.Cell>
                                <Table.Cell width={1}>payment_type</Table.Cell>
                                <Table.Cell width={2}>product_type</Table.Cell>
                                <Table.Cell width={1}>type</Table.Cell>
                            </Table.Row>
                            {users_content}
                        </Table.Body>
                    </Table>
                </Segment>
                <Button.Group attached='bottom' compact inverted size='mini'>
                    <Button icon onClick={this.getReverce} ><Icon name='angle double left' /></Button>
                    <Button>
                        <Select compact options={max_options} value={max}
                                onChange={(e, { value }) => this.setPageSize(value)}/>
                    </Button>
                    <Button icon onClick={this.getForward} ><Icon name='angle double right' /></Button>
                </Button.Group>
                {/*<Pagination pointing*/}
                {/*            secondary*/}
                {/*            defaultActivePage={1}*/}
                {/*            boundaryRange={10}*/}
                {/*            activePage={page}*/}
                {/*            onPageChange={(e, { activePage }) => this.selectPage(activePage)}*/}
                {/*            totalPages={Math.round(users.length/page_size)}>*/}
                {/*</Pagination>*/}
            </Container>
        );
    }
}

export default VhActivity;
