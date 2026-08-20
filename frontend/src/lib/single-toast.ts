import { toast as sonnerToast } from "sonner"

function dismissExistingToasts() {
  sonnerToast.dismiss()
}

const toast = Object.assign(
  (...args: Parameters<typeof sonnerToast>) => {
    dismissExistingToasts()
    return sonnerToast(...args)
  },
  {
    ...sonnerToast,
    success: (...args: Parameters<typeof sonnerToast.success>) => {
      dismissExistingToasts()
      return sonnerToast.success(...args)
    },
    error: (...args: Parameters<typeof sonnerToast.error>) => {
      dismissExistingToasts()
      return sonnerToast.error(...args)
    },
    info: (...args: Parameters<typeof sonnerToast.info>) => {
      dismissExistingToasts()
      return sonnerToast.info(...args)
    },
    warning: (...args: Parameters<typeof sonnerToast.warning>) => {
      dismissExistingToasts()
      return sonnerToast.warning(...args)
    },
    loading: (...args: Parameters<typeof sonnerToast.loading>) => {
      dismissExistingToasts()
      return sonnerToast.loading(...args)
    },
    promise: (...args: Parameters<typeof sonnerToast.promise>) => {
      dismissExistingToasts()
      return sonnerToast.promise(...args)
    },
    dismiss: (...args: Parameters<typeof sonnerToast.dismiss>) =>
      sonnerToast.dismiss(...args),
  }
) as typeof sonnerToast

export { toast }
