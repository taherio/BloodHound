import React, { Component } from 'react';
import { fullAjax, defaultAjaxSettings } from 'utils';
import LogoutModal from 'modals/LogoutModal';

export default class DatabaseDataDisplay extends Component {
	constructor(){
		super()
		this.state = {
			url: appStore.databaseInfo.url,
			user: appStore.databaseInfo.user,
			num_users: 'Refreshing',
			num_computers: 'Refreshing',
			num_groups: 'Refreshing',
			num_relationships: 'Refreshing',
			num_sessions: 'Refreshing',
			interval: null
		}
	}

	componentDidMount() {
		this.refreshDBData()
		var x = setInterval(function(){
			this.refreshDBData()
		}.bind(this), 60000);
		this.setState({interval: x})
		emitter.on('hideDBClearModal', this.refreshDBData.bind(this))
		emitter.on('refreshDBData', this.refreshDBData.bind(this))
	}

	componentWillUnmount() {
		clearInterval(this.state.interval)
		this.setState({interval: null})
	}

	toggleLogoutModal(){
		emitter.emit('showLogout');
	}

	toggleDBWarnModal(){
		emitter.emit('openDBWarnModal')
	}
	

	render() {
		return (
			<div>
				<h3>Database Info</h3>
				<dl className="dl-horizontal dl-horizontal-fix">
					<dt>DB Address</dt>
					<dd>{this.state.url}</dd>
					<dt>DB User</dt>
					<dd>{this.state.user}</dd>
					<dt>Users</dt>
					<dd>{this.state.num_users}</dd>
					<dt>Computers</dt>
					<dd>{this.state.num_computers}</dd>
					<dt>Groups</dt>
					<dd>{this.state.num_groups}</dd>
					<dt>Sessions</dt>
					<dd>{this.state.num_sessions}</dd>
					<dt>Relationships</dt>
					<dd>{this.state.num_relationships}</dd>
				</dl>

				<div className="text-center">
					<div className="btn-group dbbuttons">
						<button type="button" className="btn btn-success" onClick={function(){this.refreshDBData()}.bind(this)}>Refresh DB Stats</button>
						<button type="button" className="btn btn-warning" onClick={this.toggleLogoutModal}>Log Out/Switch DB</button>
						<button type="button" className="btn btn-danger" onClick={this.toggleDBWarnModal}>Clear Database</button>
					</div>
				</div>
			</div>
		);
	}

	refreshDBData(){
		var user,computer,group,sessions,relationship;
		user = defaultAjaxSettings();
		computer = defaultAjaxSettings();
		group = defaultAjaxSettings();
		relationship = defaultAjaxSettings();
		sessions = defaultAjaxSettings();

		user.data = JSON.stringify({
			'statements': [{
				'statement': "MATCH (n:User) WHERE NOT n.name ENDS WITH '$' RETURN count(n)"
			}]
		})
		user.success = function(json){
			this.setState({num_users:json.results[0].data[0].row[0] })
		}.bind(this)

		group.data = JSON.stringify({
			'statements': [{
				'statement': "MATCH (n:Group) RETURN count(n)"
			}]
		})
		group.success = function(json){
			this.setState({num_groups:json.results[0].data[0].row[0] })
		}.bind(this)

		computer.data = JSON.stringify({
			'statements': [{
				'statement': "MATCH (n:Computer) RETURN count(n)"
			}]
		})
		computer.success = function(json){
			this.setState({num_computers:json.results[0].data[0].row[0] })
		}.bind(this)

		relationship.data = JSON.stringify({
			'statements': [{
				'statement': "MATCH ()-[r]->() RETURN count(r)"
			}]
		})
		relationship.success = function(json){
			this.setState({num_relationships:json.results[0].data[0].row[0] })
		}.bind(this)

		sessions.data = JSON.stringify({
			'statements': [{
				'statement': "MATCH ()-[r:HasSession]->() RETURN count(r)"
			}]
		})
		sessions.success = function(json){
			this.setState({num_sessions:json.results[0].data[0].row[0] })
		}.bind(this)

		$.ajax(user);
		$.ajax(computer);
		$.ajax(group);
		$.ajax(relationship);
		$.ajax(sessions);
	}
}
