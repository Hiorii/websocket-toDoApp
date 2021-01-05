import React from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const socket = io('localhost:8000');

class App extends React.Component {
  componentDidMount() {
    socket.on('removeTask', (id)=>this.removeTask(id));
    socket.on('addTask',(task)=>this.addTask(task));
    socket.on('updateData',(tasks)=>this.updateTask(tasks));
  }
  state= {
    tasks: [],
    taskData: {
        id:'',
        name:'',
        isEdited: false,
    },
  }

  submitForm(e) {
      e.preventDefault();
      this.addTask(this.state.taskData);
      socket.emit('addTask',this.state.taskData);
      this.setState({
          taskData: {name: ''}
      });
  }
  addTask(task) {
    this.setState({
        task: this.state.tasks.push(task)
    })
  }
  removeTask(id, local) {
      let array = [...this.state.tasks];
      if (id !== -1) {
          array.splice(id, 1);
          this.setState({tasks: array});
      }
      local && socket.emit('removeTask',id);
  }
  editTask(id, local) {
      let array = [...this.state.tasks];
      const editedItem = array.find(item=> item.id === id);
      const indexOfEditedItem = this.state.tasks.indexOf(editedItem);
      this.setState({
          task: this.state.tasks[indexOfEditedItem].isEdited = true,
      })
  }

  confirmEditTask(e, id) {
      e.preventDefault();
      let array = [...this.state.tasks];
      const editedItem = array.find(item=> item.id === id);
      const indexOfEditedItem = this.state.tasks.indexOf(editedItem);
      this.setState({
          task: this.state.tasks[indexOfEditedItem].isEdited = false,
          name: this.state.tasks[indexOfEditedItem].name = e.target.elements[0].value,
      })
      socket.emit('editTask',editedItem);
  }

  updateTask(tasks) {
    this.setState({
        tasks: tasks,
    })
  }
  render() {
      const {tasks, taskData} = this.state;
      return (
          <div className="App">

              <header>
                  <h1>ToDoList.app</h1>
              </header>

              <section className="tasks-section" id="tasks-section">
                  <h2>Tasks</h2>

                  <ul className="tasks-section__list" id="tasks-list">
                      {tasks.map((task)=> {
                          return(
                              <>
                                  {!task.isEdited &&
                                  <li className="task" key={task.id}>
                                      {task.name}
                                      <div>
                                          <button
                                              className="btn btn--green"
                                              onClick={() => this.editTask(task.id, true)}
                                          >
                                              Edit
                                          </button>
                                          <button
                                              className="btn btn--red"
                                              onClick={() => this.removeTask(task.id, true)}
                                          >
                                              Remove
                                          </button>
                                      </div>
                                  </li>
                                  }
                                  {task.isEdited &&
                                  <li className="task" key={task.id}>
                                      <form onSubmit={e=>this.confirmEditTask(e, task.id)}>
                                          <input className='taskInput'
                                              type="text"
                                              name='editedValue'
                                              defaultValue={task.name}
                                          />
                                          <button
                                              className="btn btn--green"
                                          >
                                              Confirm
                                          </button>
                                      </form>
                                  </li>
                                  }
                              </>
                          )})}
                  </ul>

                  <form id="add-task-form" onSubmit={(e)=>this.submitForm(e)}>
                      <input
                          className="text-input"
                          autoComplete="off"
                          type="text"
                          placeholder="Type your description"
                          id="task-name"
                          value={taskData.name}
                          onChange={(e) => this.setState({taskData: {id: uuidv4(), name:e.target.value, isEdited:false}})}
                      />
                      <button className="btn" type="submit">Add</button>
                  </form>

              </section>
          </div>
      );
  };

};

export default App;