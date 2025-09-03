class taxonomyTreeStore {
  activeTax = $state(null);
  paramsFilter = $state({
    num_children: 0,
    children: [],
    FilteredTaxonomy:null,
    lastClickedItem:null
  });
  treeData = $state(null);
  get ParamsFilter() {
    return this.paramsFilter;
  }

  set ParamsFilter(params) {
    this.paramsFilter = params;
  }

  /**
   * Set filtered taxonomy - triggers reactivity properly
   * @param {object|null} filteredTaxonomy - The filtered taxonomy object
   */
  setFilteredTaxonomy(filteredTaxonomy) {
    this.paramsFilter = {
      ...this.paramsFilter,
      FilteredTaxonomy: filteredTaxonomy
    };
  }

  /**
   * Get the current filtered taxonomy
   * @returns {object|null} - The current filtered taxonomy
   */
  get FilteredTaxonomy() {
    return this.paramsFilter.FilteredTaxonomy;
  }

  get ActiveTax() {
    return this.activeTax;
  }

  set ActiveTax(tax) {
    this.activeTax = tax;
  }

  get TreeData() {
    return this.treeData;
  }

  set TreeData(data) {
    this.treeData = data;
  }

  /**
   * Find an object and its direct children by path ID
   * @param {string} pathId - The path ID to search for (e.g., 'class-0', 'order-1', 'genus-5')
   * @returns {object|null} - Returns the found object with its children, or null if not found
   */
  findByPathId(pathId) {
    if (!this.treeData) {
      console.warn("Tree data not loaded yet");
      return null;
    }

    // Recursive function to search through the tree
    function searchTree(node) {
      // Check if current node matches the path
      if (node.path === pathId) {
        return {
          ...node,
          directChildren: node.children || [],
        };
      }

      // Search in children if they exist
      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          const result = searchTree(child);
          if (result) {
            return result;
          }
        }
      }

      return null;
    }

    return searchTree(this.treeData);
  }

  /**
   * Get direct children of an object by path ID
   * @param {string} pathId - The path ID to search for
   * @returns {array} - Returns array of direct children, or empty array if not found
   */
  getDirectChildrenByPathId(pathId) {
    const found = this.findByPathId(pathId);
    return found ? found.children || [] : [];
  }

  /**
   * Get object info by path ID (without children for lighter response)
   * @param {string} pathId - The path ID to search for
   * @returns {object|null} - Returns the found object info, or null if not found
   */
  getInfoByPathId(pathId) {
    const found = this.findByPathId(pathId);
    if (!found) return null;

    // Return object without heavy children array
    const { children, ...info } = found;
    return {
      ...info,
      childrenCount: children ? children.length : 0,
    };
  }

  /* FilteredTaxonomy=$derived(()=>{
    return this.treeData;
}) */
}
export const _taxonomyTreeStore = new taxonomyTreeStore();
