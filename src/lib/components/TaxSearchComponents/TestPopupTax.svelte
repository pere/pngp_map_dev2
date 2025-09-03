<script>
    import { Separator } from "$lib/components/ui/separator/index.js";
    //@ts-nocheck
    //@no-lint
    //@ts-ignore

    // Required props
    export let tax;
    export let inat;
    export let properties;

    // Define fields and labels based on inat value
    let fields_filters, labels, fields;


    if (inat === false) {
        fields_filters = ['species_n','altitude_g','valley','year',
            'month','total_ind','obs','data_qua_1','data_quality','tax_level','timestamp'];

        labels = {
            'species_n':'Species',
            'altitude_g':'Altitude',
            'valley':'Valley',
            'year':'Year',
            'month':'Month',
            'total_ind':'Total individuals',
            'obs':'Observations',
            'data_qua_1':'Data quality',
            'data_quality':'Data quality (%)',
            'tax_level':'Tax level',
            'timestamp':'Timestamp'
        };
    } else {
        /* fields_filters = ['common_name','coord_obs','iconic_tax','id','image_url','inat_tax_id',
            'obs_time','place_guess','pngp_tax_id','pos_accuracy','quality','sp_name',
            'species_guess','time_zone','url','user_id','user_login','user_name','uuid']; */
fields_filters = ['sp_name','common_name','user_name','obs_time','place_guess',
'pos_accuracy','quality','species_guess','url','image_url','inat_tax_id'];
        labels = {
            'sp_name':'Species name',
            'common_name':'Common name',
            'user_name':'User name',
           /*  'coord_obs':'Coord obs', */
            /* 'iconic_tax':'Iconic tax',
            'id':'ID', */
            /* 'image_url':'Image url', */
           /*  'inat_tax_id':'INAT tax id', */
            'obs_time':'Obs time',
            'place_guess':'Place guess',
          /*   'pngp_tax_id':'PNGP tax id', */
            'pos_accuracy':'Pos accuracy',
            'quality':'Quality',

            'species_guess':'Species guess',

            /* 'time_zone':'Time zone', */
            'url':'URL to the record',
            'image_url':'Image url',
            'inat_tax_id':'Species distribution in iNaturalist'

            /* 'user_id':'User id',
            'user_login':'User login', */

            /* 'uuid':'UUID' */
        };
    }

    // Filter properties based on the selected fields
    fields = Object.entries(properties).filter(([key, value]) =>
        fields_filters.includes(key) && value !== null && value !== undefined);

    let fieldsObj=Object.fromEntries(fields);
    console.log('fieldsObj in popupt',fieldsObj);

</script>
<div class="w-full flex flex-col">

        <div class="w-full mx-auto mr-2 overflow-hidden">
        <div class="bg-transparent">
            {#if inat===false}
                {#if tax.medium_url}

                <div class="m-.5 overflow-hidden rounded-md">
                    <img class="w-full h-full object-cover"
                    src={tax.medium_url}
                    alt={tax.species_n}
                    >
                </div>
                <!--  <div class="md:shrink-0">
                        <img
                            class="h-15 w-full object-cover md:h-full md:w-15"
                            src={tax.medium_url}
                            alt={tax.species_n}
                        >
                    </div> -->
                {:else}
                <div class="m-.5 overflow-hidden rounded-md">
                        <img class="w-full h-full object-cover"
                            src="https://blocks.astratic.com/img/general-img-square.png"
                            alt=""
                        >
                    </div>
                {/if}
            {:else}
                {#if fieldsObj.image_url}
                <div class="m-.5 overflow-hidden rounded-md">
                    <img class="w-full h-full object-cover"
                    src={fieldsObj.image_url}
                    alt={fieldsObj.sp_name}
                    >
                </div>
                {/if}
            {/if}

            <div class="p-2 overflow-auto">
                <div class="tracking-wide text-gray-700">
                    {tax.species_n}
                </div>
                <span class="block mt-1 mb-1leading-tight font-light text-gray-600">
                    {tax.pngp_data?.name_it} / {tax.pngp_data?.name_eng || tax.preferred_common_name}
                </span>


                <Separator/>


                    {#if tax.pngp_data && tax.pngp_data.family_n}
                    <div class="text-xs text-gray-500 mb-1">
                    {#each ['class_n','order_n','family_n','genus_n'] as item, i}
                            <span class="font-light">
                                {tax.pngp_data?.[item]}
                                {#if i < 3}/{/if}
                            </span>
                        {/each}
                    </div>
                    <Separator />
                    {/if}

                <div class="text-gray-500 text-sm mb-1">
                    <ul>
                    {#each fields as [key, value]}
                     {@const url=typeof value === 'string' && value.indexOf('https://') === 0}
                     {@const valueModified=url ? `<a class="text-blue-500 underline" href="${value}" target="_blank">Url</a>` : value}
                        <li class="font-light">

                            {#if key === 'inat_tax_id'}
                            <span class="text-gray-800">{labels[key] || key}</span>  :
                            <span class="font-light text-gray-500"><a class="text-blue-500 underline" href={`https://www.inaturalist.org/observations?project_id=citizen-science-parco-nazionale-gran-paradiso&subview=map&taxon_id=${value}&verifiable=any`} target="_blank">INAT tax id</a></span>
                            {:else}
                            <span class="text-gray-800">{labels[key] || key}</span>  : <span class="font-light text-gray-500">{@html valueModified}</span>
                            {/if}
                        </li>
                    {/each}
                    </ul>
                </div>

            </div>
        </div>
    </div>

</div>

