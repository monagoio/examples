import Head from 'next/head'
import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, VStack, AlertIcon, Alert, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from "@chakra-ui/react"
import React, { useRef, useState, useCallback, useEffect, Fragment } from 'react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'

import { MonagoClient } from '@monagoio/monagojs'

const Todo = ({ title, id, desc, open, del, ...rest }) => {

  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef()

  return (
    <Fragment>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete {title}
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure delete {title}?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={() => { return del(id) }} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Box className='w-full' p={5} borderWidth='1px' {...rest}>
        <Flex className='positioning' alignItems='center'>
          <div>
            <Heading fontSize='xl'> {title} </Heading>
            <Text fontSize="s">{desc}</Text>
          </div>
          <div>
            <Button onClick={() => open({ name: title, _id: id, description: desc, action: "update" })} colorScheme='yellow'><EditIcon /></Button>
            <Button onClick={onOpen} colorScheme='red' ml='2'><DeleteIcon /></Button>
          </div>
        </Flex>
      </Box>
    </Fragment>
    
  )
}

const SECRET_KEY = process.env.NEXT_PUBLIC_MONAGO_SECRET_KEY

const client = new MonagoClient({
  secretKey: SECRET_KEY
})

export default function Home() {

  const initialState = {
    name:null,
    description:null
  }

  const { isOpen, onOpen, onClose } = useDisclosure()
  const initialRef = useRef(null)
  const finalRef = useRef(null)
  const [tasks, setTask] = useState([])
  const [formTask, setFormTask] = useState({})
  const [notification, setNotification] = useState(false)
  const [notificationText, setNotificationText] = useState(initialState)

  const fetchTodo = useCallback(async () => {

    let result = []
    try {

      const response = await client.get({ url: "/todo", params: {
        "page": 1,
        "limit": 10,
        "orderby": "desc"
      }})
      const result = response.data.data

      setTask(result)

    } catch (error) {
      console.log(error.message)
    }
    return result
  }, [tasks])

  const createTodo = useCallback(async () => {
    try {
      console.log(formTask)
      await client.post({ url: "/todo", data: {
        name: formTask.name,
        description: formTask.description
      }})

      fetchTodo()
      setFormTask({})
      onClose()
      setNotification(true)
      setNotificationText({
        name: "success",
        description: "Add todo success"
      })

      setTimeout(() => {
        setNotification(prev => !prev)
      },1500)

    } catch (error) {
      console.log(error.message)
    }
  }, [formTask])



  const updateTodo = useCallback(async () => {
    try {

      await client.put({ url: `/todo/${formTask._id}`, data: {
          name: formTask.name,
          description: formTask.description
      }})

      fetchTodo()
      setFormTask({})
      setNotification(true)
      setNotificationText({
        name: "info",
        description: "Update todo success"
      })

      setTimeout(() => {
        setNotification(prev => !prev)
      },1500)

      onClose()

    } catch (error) {
      console.log(error.message)
    }

  }, [formTask])


  const save = useCallback(async () => {

    console.log(formTask)
    if (formTask.action === "update") {
      updateTodo()
    } else {
      createTodo()
    }

  }, [formTask])


  const deleteTodo = useCallback(async (id) => {

    try {

      await client.delete({ url: `/todo/${id}` })

      setNotification(true)
      setNotificationText({
        name: "error",
        description: "Delete todo success"
      })

      setTimeout(() => {
        setNotification(prev => !prev)
      },1500)

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
         {notification && <AlertNotification status={notificationText.name} description={notificationText.description}/>}
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
                  <Todo key={task._id}
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

const AlertNotification = (props) => {
  return(
    <Alert status={`${props.status}`}>
    <AlertIcon />
      {props.description}
    </Alert>
  )
}