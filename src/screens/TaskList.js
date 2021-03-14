import React, {Component} from 'react'
import {
    Alert,
    View, 
    Text, 
    StyleSheet, 
    ImageBackground, 
    FlatList, 
    TouchableOpacity, 
    Platform} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import todayImage from '../../assets/imgs/today.jpg'
import moment from 'moment'
import 'moment/locale/pt-br'
import commonStyles from '../commonStyles'
import Task from '../components/Task'
import AddTask from './AddTask'
import AsyncStorage from "@react-native-community/async-storage"

const initialState = {
    showDoneTasks: true,
    showAddTaskModal: false,
    visibleTasks: [],
    tasks: []
}

export default class TaskList extends Component {

    state = {
        ...initialState
    }

    toogleFilter = () => {
        this.setState({showDoneTasks: !this.state.showDoneTasks}, this.filterTasks)
    }

    filterTasks = () => {
        let visibleTasks = null
        if(this.state.showDoneTasks) {
            visibleTasks = [...this.state.tasks]
        } else {
            /* const pending = task => task.doneAt === null */    
            visibleTasks = this.state.tasks.filter(this.isPending)
        }
        this.setState({visibleTasks})
        AsyncStorage.setItem('state', JSON.stringify(this.state))
    }

    isPending = task => {
        return task.doneAt === null
    }

    componentDidMount = async () => {
        const stateString = await AsyncStorage.getItem('state')
        const state = JSON.parse(stateString) || initialState
        this.setState(state, this.filterTasks)
    }

    onToggleTask = taskId => {
        const tasks = [...this.state.tasks]
        tasks.forEach(task => {
            if(task.id === taskId) {
                task.doneAt = task.doneAt ? null : new Date()
            }
        })

        this.setState({tasks }, this.filterTasks)
    }

    deleteTask = (id) => {
        const tasks = this.state.tasks.filter(task => task.id !== id)
        this.setState({tasks}, this.filterTasks)
    }



    addTask = (newTask) => {
        if(!newTask.desc || !newTask.desc.trim) {
            Alert.alert('Dados Inválidos','Descrição não informada')
            return
        }

        const tasks = [...this.state.tasks]
        tasks.push({
            id: Math.random(),
            desc: newTask.desc,
            estimateAt: newTask.date,
            doneAt: null
        })

        this.setState( {tasks, showAddTaskModal: false }, this.filterTasks )
    }

    render() {
        
        const hoje = moment().format('ddd, D [de] MMMM')
        return (
            <View style={styles.container}>

                <AddTask 
                    onCancel={() => this.setState( {showAddTaskModal: false})} isVisible={this.state.showAddTaskModal}
                    onSave={this.addTask} />
                <ImageBackground source={todayImage} style={styles.background}>
                    <View style={styles.iconBar}>
                        <TouchableOpacity onPress={this.toogleFilter}>
                            <Icon name={this.state.showDoneTasks ? 'eye' : 'eye-slash'} 
                                size={20} color={commonStyles.colors.secondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>Hoje</Text>
                        <Text style={styles.subTitle}>{hoje}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.taskList}>
                    <FlatList data={this.state.visibleTasks}
                            keyExtractor={item => `${item.id}`}
                            renderItem={({item}) => <Task {...item} onToggleTask={this.onToggleTask} onDelete={this.deleteTask} />} />
                </View>
                <TouchableOpacity style={styles.addButton}
                    activeOpacity={0.7}
                    onPress={() => this.setState({showAddTaskModal: true})}>
                    <Icon name="plus" size={20} 
                        color={commonStyles.colors.secondary} />
                </TouchableOpacity>

            </View>
        )
    }
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
    },
    background: {
        flex: 3,
    },
    taskList: {
        flex: 7
    },
    titleBar: {
        flex: 1,
        justifyContent: 'flex-end'
    }, 
    title: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 50,
        marginLeft: 20,
        marginBottom: 20
    },
    subTitle: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 30
    },
    iconBar: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'flex-end',
        marginTop: Platform.OS === 'ios' ? 40 : 10,
    },
    addButton: {
        flex: 1,
        position: 'absolute',
        right: 30,
        bottom: 30,
        height: 50,
        width: 50,
        borderRadius: 25,
        backgroundColor: commonStyles.colors.today,
        justifyContent: 'center',
        alignItems: 'center',
    }
})