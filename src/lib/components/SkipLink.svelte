<script lang="ts">
  /**
   * Skip Link Component
   *
   * Provides accessible skip navigation for keyboard users.
   * Place at the very top of your layout, before any navigation.
   *
   * @example
   * <SkipLink href="#main-content" />
   * <!-- ... navigation ... -->
   * <main id="main-content">
   *   <!-- content -->
   * </main>
   */

  interface Props {
    /** Target element ID to skip to (without #) */
    href?: string;
    /** Custom label text */
    label?: string;
  }

  let { href = '#main-content', label = 'Skip to main content' }: Props = $props();

  // Ensure href starts with #
  const targetHref = $derived(href.startsWith('#') ? href : `#${href}`);
</script>

<a href={targetHref} class="skip-link">
  {label}
</a>
