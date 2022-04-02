import type { Meta, Story } from '@storybook/vue3'
import { ElButton } from 'element-plus'

export default {
  title: 'Button',
  component: ElButton,
} as Meta

// More on component templates: https://storybook.js.org/docs/vue/writing-stories/introduction#using-args
const Template: Story = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { ElButton },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args }
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<ElButton v-bind="args" type="primary">点我</ElButton>',
})

export const Button = Template.bind({})
