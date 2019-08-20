import {observable} from 'mobx';

export const Store = observable({
    isAuthenticated: false,
    activeUser: "Guest",
    empAppliedLeaves: []
 });
