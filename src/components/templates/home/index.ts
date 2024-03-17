export { default as Home } from './Home';
import { statAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
createMultiStyleConfigHelpers(statAnatomy.keys)

const danger = definePartsStyle({
  container: {
    borderRadius: "lg",
    border: "2px solid",
    borderColor: "red.100",
    p: 1
  },
  helpText: {
    fontWeight: "bold"
  },
  label: {
    color: "red.500"
  },
  number: {
    fontStyle: "italic",
    color: "red.400"
  }
})

const great =  definePartsStyle({
  container: {
    borderRadius: "lg",
    border: "2px solid",
    borderColor: "yellow.500",
    p: 1,
  },
  helpText: {
    fontWeight: "bold"
  },
  label: {
    color: "yellow.500"
  },
  number: {
    fontStyle: "italic",
    color: "yellow.500"
  },
})

export const statTheme = defineMultiStyleConfig({
  variants: { danger , great},
})