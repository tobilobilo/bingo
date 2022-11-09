<template>
    <header class="container board">
        <div class="row">
            <div class="col-12">
                <h1 class="lighten">{{ title }}</h1>
            </div>
        </div>
    </header>
</template>

<script>
export default {
    name: 'Header',
    props: {
        title: String
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
    text-align: center;
    padding: 2rem;
}
</style>
