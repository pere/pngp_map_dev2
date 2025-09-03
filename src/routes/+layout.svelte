<script>
	import { Toaster } from "$lib/components/ui/sonner/index.js";
	import '../app.css';



	let { children } = $props();
</script>

<Toaster  position="top-center"
toastOptions={{
    classNames: {
      toast: '!text-lg',
      title: '!text-lg',
      description: '!text-lg',
      sp_name: '!text-lg',
      cancelButton: 'cancel-button',
      closeButton: 'close-button',
    },
  }}/>
{@render children()}
