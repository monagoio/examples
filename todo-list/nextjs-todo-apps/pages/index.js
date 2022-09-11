import Head from 'next/head'
import { Box, Form, Button, Flex, FormControl, FormLabel, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, VStack } from "@chakra-ui/react"
import { useRef, useState, useCallback, useEffect } from 'react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import axios from 'axios'
const URL = process.env.MONAGO_URL || 'https://api.monago.io/huseindra/todoapps/v1/tasks'


const Todo = ({ title, id, desc, open, del, ...rest }) => {
  return (
    <Box className='w-full' p={5} borderWidth='1px' {...rest}>
      <Flex className='positioning' alignItems='center'>
        <Text>
          <Heading fontSize='xl'> {title} </Heading>
          <Text fontSize="s">{desc}</Text>
        </Text>
        <div>
          <Button onClick={() => open({ name: title, _id: id, description: desc, action: "update" })} colorScheme='yellow'><EditIcon /></Button>
          <Button onClick={() => { return confirm("Are you sure delete " + title + "?") && del(id) }} colorScheme='red' ml='2'><DeleteIcon /></Button>
        </div>
      </Flex>
    </Box>
  )
}

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const initialRef = useRef(null)
  const finalRef = useRef(null)
  const [tasks, setTask] = useState([])
  const [formTask, setFormTask] = useState({})

  const fetchTodo = useCallback(async () => {

    let result = []
    try {

      const response = await axios.get(`${URL}?page=1&limit=10&orderby=asc`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      result = response.data.data

      setTask(result)

    } catch (error) {
      console.log(error.message)
    }
    return result
  }, [tasks])

  const createTodo = useCallback(async () => {
    try {

      await axios.post(`${URL}`, formTask, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      fetchTodo()
      setFormTask({})
      onClose()

    } catch (error) {
      console.log(error.message)
    }
  }, [formTask])



  const updateTodo = useCallback(async () => {
    try {
      await axios.put(`${URL}/${formTask._id}`, {
        name: formTask.name,
        description: formTask.description
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      fetchTodo()
      setFormTask({})
      onClose()

    } catch (error) {
      console.log(error.message)
    }

  }, [formTask])


  const save = useCallback(async () => {

    console.log(formTask)
    if (formTask.action == "update") {
      updateTodo()
    } else {
      createTodo()
    }

  }, [formTask])


  const deleteTodo = useCallback(async (id) => {

    try {

      await axios.delete(`${URL}/${id}`, formTask, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      fetchTodo()

    } catch (error) {
      console.log(error.message)
    }

  }, [formTask])

  const openUpdate = (task) => {
    setFormTask(task)
    onOpen()
  }



  useEffect(() => {
    fetchTodo()
  }, [])

  const updateFormTask = evt => setFormTask({
    ...formTask,
    [evt.target.name]: evt.target.value
  });


  return (
    <div className='main-background'>
      <Head>
        <title>Todo Example - Monago</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box className='flex-center'>
        <nav className='navigation-menu'>
          <div className='logo-main'>
            <a>Todo</a>
          </div>
          <div>
            <Button colorScheme='orange' onClick={() => { onOpen(); setFormTask({}) }} >Add Task</Button>
          </div>
        </nav>
        <div className='container'>
          <Heading fontSize='xl' mb={5}>Todo List</Heading>
          <VStack spacing={8}>
            {
              tasks.map(task => {
                return (
                  <Todo
                    title={task.name}
                    desc={task.description}
                    id={task._id}
                    del={deleteTodo}
                    open={openUpdate}
                  />
                )
              })
            }
          </VStack>
        </div>
      </Box>
      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Activity</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Name Activity</FormLabel>
              <Input value={formTask.name} name="name" ref={initialRef} onChange={updateFormTask} placeholder='Name' />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Description Activity</FormLabel>
              <Input value={formTask.description} name="description" onChange={updateFormTask} placeholder='Description' />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={save} colorScheme='blue' mr={3}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div >

  )
}
